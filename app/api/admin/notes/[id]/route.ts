import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { writePrivatePdf, writePreviewPdf } from "@/lib/storage";

function toStatus(input: string, fallback: string) {
  return input === "PUBLISHED" || input === "DRAFT" || input === "ARCHIVED" ? input : fallback;
}

async function createPreviewFromPdf(buffer: Buffer, maxPages: number) {
  const source = await PDFDocument.load(buffer);
  const dest = await PDFDocument.create();
  const pageCount = Math.min(source.getPageCount(), maxPages);

  for (let i = 0; i < pageCount; i += 1) {
    const [page] = await dest.copyPages(source, [i]);
    dest.addPage(page);
  }

  return Buffer.from(await dest.save());
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorized = await isAdminAuthenticated();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await db.note.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  const formData = await request.formData();
  const methodOverride = String(formData.get("_method") || "POST").toUpperCase();

  if (methodOverride === "PATCH") {
    const restored = await db.note.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        deletedAt: null,
      },
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[Admin Notes] Note restored", { noteId: id, status: restored.status, deletedAt: restored.deletedAt });
    }

    return NextResponse.redirect(new URL("/admin/notes?restored=1", request.url));
  }

  if (methodOverride === "DELETE") {
    const archived = await db.note.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "ARCHIVED",
      },
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[Admin Notes] Note archived", { noteId: id, status: archived.status, deletedAt: archived.deletedAt });
    }

    return NextResponse.redirect(new URL("/admin/notes?archived=1", request.url));
  }

  const subjectName = String(formData.get("subject") || "");
  const categoryName = String(formData.get("category") || "");
  const chapterName = String(formData.get("chapterName") || "");
  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const rawStatus = String(formData.get("status") || existing.status);
  const status = toStatus(rawStatus, existing.status);
  const file = formData.get("file") as File | null;

  if (!subjectName || !categoryName || !chapterName || !title || !description) {
    return NextResponse.json({ error: "Missing note fields." }, { status: 400 });
  }

  const subject = await db.subject.findUnique({ where: { name: subjectName } });
  const category = await db.category.findFirst({ where: { name: categoryName, subjectId: subject?.id } });

  if (!subject || !category) {
    return NextResponse.json({ error: "Invalid subject or category." }, { status: 400 });
  }

  let pdfStorageKey = existing.pdfStorageKey;
  let previewStorageKey = existing.previewStorageKey ?? null;
  let pageCount = existing.pageCount;

  if (file && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File is too large." }, { status: 400 });
    }

    const pdfHeader = bytes.subarray(0, 5);
    if (!pdfHeader.equals(Buffer.from("%PDF-"))) {
      return NextResponse.json({ error: "Invalid PDF file." }, { status: 400 });
    }

    const pdf = await PDFDocument.load(bytes);
    pageCount = pdf.getPageCount();
    pdfStorageKey = await writePrivatePdf(bytes);

    const preview = await createPreviewFromPdf(bytes, 2);
    previewStorageKey = await writePreviewPdf(preview);
  }

  await db.note.update({
    where: { id },
    data: {
      subjectId: subject.id,
      categoryId: category.id,
      chapterName,
      title,
      description,
      pageCount,
      status,
      pdfStorageKey,
      previewStorageKey,
    },
  });

  return NextResponse.redirect(new URL("/admin/notes?updated=1", request.url));
}
