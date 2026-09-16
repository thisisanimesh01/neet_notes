import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getNoteById } from "@/lib/data";

export default async function AdminNotePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const note = await getNoteById(id);

  if (!note || note.deletedAt) {
    redirect("/admin/notes");
  }

  const previewUrl = `/api/admin/notes/${note.id}/preview`;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Admin Preview</p>
            <h1 className="mt-2 text-3xl font-black">{note.title}</h1>
          </div>
          <div className="flex gap-3">
            <Link href={`/admin/notes/${note.id}/edit`} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Edit Note</Link>
            <Link href="/admin/notes" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Back to Notes</Link>
          </div>
        </div>

        <div className="mb-6 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
          <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Subject</p><p className="mt-2 font-semibold">{note.subject.name}</p></div>
          <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Category</p><p className="mt-2 font-semibold">{note.category.name}</p></div>
          <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Chapter</p><p className="mt-2 font-semibold">{note.chapterName}</p></div>
          <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pages</p><p className="mt-2 font-semibold">{note.pageCount}</p></div>
          <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Price</p><p className="mt-2 font-semibold">₹{note.price}</p></div>
          <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p><p className="mt-2 font-semibold">{note.status}</p></div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Full note preview</h2>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Full PDF</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <object data={previewUrl} type="application/pdf" className="h-[720px] w-full bg-white">
              <embed src={previewUrl} type="application/pdf" className="h-[720px] w-full" />
              <p className="p-4 text-sm text-slate-600">Your browser does not support PDF previews. <a href={previewUrl} className="font-semibold text-slate-900 underline">Open the PDF directly.</a></p>
            </object>
          </div>
        </div>
      </div>
    </main>
  );
}
