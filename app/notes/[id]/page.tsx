import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Download, Eye } from "lucide-react";
import { CustomerNotePreview } from "@/components/customer-note-preview";
import { getNoteById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await getNoteById(id);

  if (!note) {
    redirect("/notes");
  }

  const previewUrl = `/api/notes/${note.id}/preview`;

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{note.subject.name} • {note.category.name}</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">{note.title}</h1>
            <p className="mt-3 text-slate-600">{note.description}</p>
          </div>
          <div className="rounded-[24px] bg-slate-900 p-4 text-white shadow-lg">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Price</p>
            <p className="mt-2 text-3xl font-black">₹{note.price}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
          <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Subject</p><p className="mt-2 font-semibold">{note.subject.name}</p></div>
          <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Category</p><p className="mt-2 font-semibold">{note.category.name}</p></div>
          <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Chapter</p><p className="mt-2 font-semibold">{note.chapterName}</p></div>
          <div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pages</p><p className="mt-2 font-semibold">{note.pageCount}</p></div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="#preview" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Eye className="h-4 w-4" /> Preview 2 Pages
          </Link>
          <Link href={`/purchase?noteId=${note.id}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-500">
            <Download className="h-4 w-4" /> Get Full Notes — ₹{note.price}
          </Link>
        </div>

        <CustomerNotePreview
          noteId={note.id}
          previewUrl={previewUrl}
          totalPages={note.pageCount}
          price={note.price}
        />

        <div className="mt-6 text-center">
          <Link href="/notes" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
            Back to notes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
