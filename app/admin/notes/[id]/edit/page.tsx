import Link from "next/link";
import { redirect } from "next/navigation";
import { PDFDocument } from "pdf-lib";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { getNoteById, getCategoryOptionsForSubject } from "@/lib/data";
import { writePrivatePdf, writePreviewPdf } from "@/lib/storage";

const subjectOptions = [
  { label: "Biology", value: "Biology", categories: ["Botany", "Zoology"] },
  { label: "Chemistry", value: "Chemistry", categories: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry"] },
];

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

export const dynamic = "force-dynamic";

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const note = await getNoteById(id);
  if (!note || note.deletedAt) {
    redirect("/admin/notes");
  }

  const categoryOptions = getCategoryOptionsForSubject(note.subject.name);

  async function updateNote(formData: FormData) {
    "use server";

    const authorized = await isAdminAuthenticated();
    if (!authorized) {
      redirect("/admin/login");
    }

    const existing = await db.note.findUnique({ where: { id } });
    if (!existing) {
      redirect("/admin/notes");
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
      redirect("/admin/notes?updated=0");
    }

    const subject = await db.subject.findUnique({ where: { name: subjectName } });
    const category = await db.category.findFirst({ where: { name: categoryName, subjectId: subject?.id } });

    if (!subject || !category) {
      redirect("/admin/notes?updated=0");
    }

    let pdfStorageKey = existing.pdfStorageKey;
    let previewStorageKey = existing.previewStorageKey ?? null;
    let pageCount = existing.pageCount;

    if (file && file.size > 0) {
      const bytes = Buffer.from(await file.arrayBuffer());
      if (bytes.length > 20 * 1024 * 1024) {
        redirect("/admin/notes?updated=0");
      }

      const pdfHeader = bytes.subarray(0, 5);
      if (!pdfHeader.equals(Buffer.from("%PDF-"))) {
        redirect("/admin/notes?updated=0");
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

    redirect("/admin/notes?updated=1");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</p>
            <h1 className="mt-2 text-3xl font-black">Edit note</h1>
          </div>
          <Link href="/admin/notes" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Back to notes</Link>
        </div>

        <form action={updateNote} method="POST" encType="multipart/form-data" className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Subject</label>
            <select name="subject" defaultValue={note.subject.name} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white">
              {subjectOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Category</label>
            <select name="category" defaultValue={note.category.name} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white">
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Chapter Name</label>
            <input name="chapterName" defaultValue={note.chapterName} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white" required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Title</label>
            <input name="title" defaultValue={note.title} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white" required />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea name="description" rows={4} defaultValue={note.description} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white" required />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Replace PDF (optional)</label>
            <input type="file" accept="application/pdf" name="file" className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Price</label>
            <input value={49} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-3 text-sm text-slate-700" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select name="status" defaultValue={note.status} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white">
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Cancel</button>
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700">Save Changes</button>
          </div>
        </form>
      </div>
    </main>
  );
}
