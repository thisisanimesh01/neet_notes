import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllNotesAdmin } from "@/lib/data";
import { AdminNotesActionMenu } from "@/components/admin-notes-action-menu";

export const dynamic = "force-dynamic";

export default async function AdminNotesPage({
  searchParams,
}: {
  searchParams?: Promise<{ updated?: string; archived?: string }>;
}) {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) redirect("/admin/login");

  const params = (await searchParams) ?? {};
  const notes = await getAllNotesAdmin();

  if (process.env.NODE_ENV !== "production") {
    console.log("[Admin Notes] Page loaded", { noteCount: notes.length, archivedParam: params.archived, updatedParam: params.updated });
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Manage notes</h1>
          </div>
          <Link href="/admin/notes/new" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700">+ Add New Note</Link>
        </div>

        {params.updated === "1" ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Note updated successfully.
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Chapter</th>
                  <th className="px-4 py-3 font-medium">Pages</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note: {
                  id: string;
                  title: string;
                  subject: { name: string };
                  category: { name: string };
                  chapterName: string;
                  pageCount: number;
                  price: number;
                  status: string;
                }) => {
                  const isArchived = note.status === "ARCHIVED";
                  const actionLabel = isArchived ? "Restore" : "Archive";
                  const methodValue = isArchived ? "PATCH" : "DELETE";

                  if (process.env.NODE_ENV !== "production") {
                    console.log("[Admin Notes] Action targets prepared", {
                      noteId: note.id,
                      status: note.status,
                      editUrl: `/admin/notes/${note.id}/edit`,
                      previewUrl: `/admin/notes/${note.id}/preview`,
                      actionLabel,
                      methodValue,
                    });
                  }

                  return (
                    <tr key={note.id} className="border-t border-slate-200">
                      <td className="px-4 py-3 font-medium text-slate-900">{note.title}</td>
                      <td className="px-4 py-3 text-slate-600">{note.subject.name}</td>
                      <td className="px-4 py-3 text-slate-600">{note.category.name}</td>
                      <td className="px-4 py-3 text-slate-600">{note.chapterName}</td>
                      <td className="px-4 py-3 text-slate-600">{note.pageCount}</td>
                      <td className="px-4 py-3 text-slate-600">₹{note.price}</td>
                      <td className="px-4 py-3 text-slate-600">{note.status}</td>
                      <td className="px-4 py-3">
                        <AdminNotesActionMenu noteId={note.id} title={note.title} status={note.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
