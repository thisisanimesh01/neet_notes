import { NextResponse } from "next/server";

import { PDFDocument } from "pdf-lib";

import { db } from "@/lib/db";

import { isAdminAuthenticated } from "@/lib/auth";

import {
  deletePreviewFile,
  deletePrivateFile,
  readPrivateFile,
  writePreviewPdf,
} from "@/lib/storage";

const MAX_PDF_SIZE = 50 * 1024 * 1024;

const STORAGE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.pdf$/i;

export async function POST(request: Request) {
  const authorized = await isAdminAuthenticated();

  if (!authorized) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  let privateKey: string | null = null;
  let previewKey: string | null = null;

  try {
    const body = await request.json();

    const storageKey = String(body.storageKey || "");
    const subjectName = String(body.subject || "");
    const categoryName = String(body.category || "");
    const chapterName = String(body.chapterName || "");
    const title = String(body.title || "");
    const description = String(body.description || "");
    const rawStatus = String(
      body.status || "PUBLISHED",
    );

    const status =
      rawStatus === "PUBLISHED" ||
      rawStatus === "DRAFT" ||
      rawStatus === "ARCHIVED"
        ? rawStatus
        : "DRAFT";

    // -----------------------------------------------------------------------
    // Validate request
    // -----------------------------------------------------------------------

    if (
      !storageKey ||
      !subjectName ||
      !categoryName ||
      !chapterName ||
      !title ||
      !description
    ) {
      return NextResponse.json(
        { error: "Missing note fields." },
        { status: 400 },
      );
    }

    // The server generated this key. Only accept UUID.pdf filenames.
    if (!STORAGE_KEY_PATTERN.test(storageKey)) {
      return NextResponse.json(
        { error: "Invalid storage key." },
        { status: 400 },
      );
    }

    // -----------------------------------------------------------------------
    // Validate subject/category
    // -----------------------------------------------------------------------

    const subject = await db.subject.findUnique({
      where: {
        name: subjectName,
      },
    });

    const category = await db.category.findFirst({
      where: {
        name: categoryName,
        subjectId: subject?.id,
      },
    });

    if (!subject || !category) {
      return NextResponse.json(
        {
          error: "Invalid subject or category.",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------------------------------------
    // Download the uploaded PDF from private Supabase storage
    // -----------------------------------------------------------------------

    privateKey = storageKey;

    const bytes = await readPrivateFile(storageKey);

    // -----------------------------------------------------------------------
    // Size validation
    // -----------------------------------------------------------------------

    if (bytes.length > MAX_PDF_SIZE) {
      await deletePrivateFile(storageKey);
      privateKey = null;

      return NextResponse.json(
        {
          error:
            "File is too large. Maximum allowed size is 50 MB.",
        },
        { status: 400 },
      );
    }

    if (bytes.length === 0) {
      await deletePrivateFile(storageKey);
      privateKey = null;

      return NextResponse.json(
        {
          error: "Uploaded PDF is empty.",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------------------------------------
    // Validate PDF signature
    // -----------------------------------------------------------------------

    const pdfHeader = bytes.subarray(0, 5);

    if (!pdfHeader.equals(Buffer.from("%PDF-"))) {
      await deletePrivateFile(storageKey);
      privateKey = null;

      return NextResponse.json(
        {
          error: "Invalid PDF file.",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------------------------------------
    // Parse PDF
    // -----------------------------------------------------------------------

    const originalPdf = await PDFDocument.load(bytes);

    const pageCount = originalPdf.getPageCount();

    if (pageCount < 1) {
      await deletePrivateFile(storageKey);
      privateKey = null;

      return NextResponse.json(
        {
          error: "PDF does not contain any pages.",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------------------------------------
    // Generate 2-page preview
    // -----------------------------------------------------------------------

    const previewBuffer =
      await createPreviewFromPdf(bytes, 2);

    previewKey = await writePreviewPdf(
      previewBuffer,
    );

    // -----------------------------------------------------------------------
    // Create database record
    // -----------------------------------------------------------------------

    const note = await db.note.create({
      data: {
        subjectId: subject.id,
        categoryId: category.id,
        chapterName,
        title,
        description,

        // Original private PDF
        pdfStorageKey: privateKey,

        // 2-page preview PDF
        previewStorageKey: previewKey,

        pageCount,

        // Server-side fixed price
        price: 49,

        status,
      },
    });

    // Both storage objects now belong to a database record.
    privateKey = null;
    previewKey = null;

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error(
      "[Admin Notes Finalize Error]:",
      error,
    );

    // -----------------------------------------------------------------------
    // Cleanup orphaned files
    // -----------------------------------------------------------------------

    if (previewKey) {
      try {
        await deletePreviewFile(previewKey);
      } catch (cleanupError) {
        console.error("[Admin Notes Preview Cleanup Error]:", cleanupError);
      }
    }

    if (privateKey) {
      try {
        await deletePrivateFile(privateKey);
      } catch (cleanupError) {
        console.error(
          "[Admin Notes Private PDF Cleanup Error]:",
          cleanupError,
        );
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : "Upload failed.";

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}

async function createPreviewFromPdf(
  buffer: Buffer,
  maxPages: number,
) {
  const source = await PDFDocument.load(buffer);

  const destination =
    await PDFDocument.create();

  const pageCount = Math.min(
    source.getPageCount(),
    maxPages,
  );

  for (
    let i = 0;
    i < pageCount;
    i += 1
  ) {
    const [page] =
      await destination.copyPages(
        source,
        [i],
      );

    destination.addPage(page);
  }

  return Buffer.from(
    await destination.save(),
  );
}