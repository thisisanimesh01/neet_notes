import Link from "next/link";
import { Search } from "lucide-react";
import { getPublishedNotes } from "@/lib/data";

type NoteListItem = Awaited<ReturnType<typeof getPublishedNotes>>[number];

export const dynamic = "force-dynamic";

export default async function NotesPage({
  searchParams,
}: {
  searchParams?: Promise<{ subject?: string; category?: string; q?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const notes = await getPublishedNotes();
  const filtered = notes.filter((note: NoteListItem) => {
    const matchesSubject = params.subject ? note.subject.name === params.subject : true;
    const matchesCategory = params.category ? note.category.name === params.category : true;
    const text = params.q?.toLowerCase() ?? "";
    const matchesQuery = !text || `${note.title} ${note.chapterName} ${note.subject.name} ${note.category.name}`.toLowerCase().includes(text);
    return matchesSubject && matchesCategory && matchesQuery;
  });

  const subjectOptions = Array.from(new Set(notes.map((note: NoteListItem) => note.subject.name))) as string[];
  const categoryOptions = Array.from(new Set(notes.map((note: NoteListItem) => note.category.name))) as string[];

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Study notes</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Browse handwritten notes</h1>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">{filtered.length} notes available</div>
        </div>

        <div className="mb-8 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <form className="grid gap-4 md:grid-cols-[1.3fr_0.8fr_0.8fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input name="q" defaultValue={params.q ?? ""} placeholder="Search chapter, title, subject, category" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none ring-0 focus:border-slate-400 focus:bg-white" />
            </div>
            <select name="subject" defaultValue={params.subject ?? ""} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white">
              <option value="">All</option>
              {subjectOptions.map((subject: string) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <select name="category" defaultValue={params.category ?? ""} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white">
              <option value="">All</option>
              {categoryOptions.map((category: string) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button type="submit" className="md:col-span-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700">Apply filters</button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((note: NoteListItem) => (
            <div key={note.id} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Handwritten notes</span>
                <span className="text-lg font-black text-slate-900">₹49</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{note.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{note.subject.name} • {note.category.name}</p>
              <p className="mt-3 text-sm text-slate-600">{note.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>{note.pageCount} pages</span>
                <span>2-page preview</span>
              </div>
              <div className="mt-6 flex gap-3">
                <Link href={`/notes/${note.id}`} className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">Preview</Link>
                <Link href={`/purchase?noteId=${note.id}`} className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-slate-700">Get Full Notes — ₹49</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
