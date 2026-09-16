"use client";

import Link from "next/link";

type Props = {
  noteId: string;
  title: string;
  status: string;
};

export function AdminNotesActionMenu({ noteId, title, status }: Props) {
  const isArchived = status === "ARCHIVED";
  const actionLabel = isArchived ? "Restore" : "Archive";
  const methodValue = isArchived ? "PATCH" : "DELETE";

  const handleEditClick = () => {
    console.log("[Admin Notes] Edit clicked", { noteId, title, url: `/admin/notes/${noteId}/edit` });
  };

  const handlePreviewClick = () => {
    console.log("[Admin Notes] Preview clicked", { noteId, title, url: `/admin/notes/${noteId}/preview` });
  };

  const handleArchiveToggleClick = () => {
    console.log("[Admin Notes] Archive/Restore clicked", {
      noteId,
      title,
      currentStatus: status,
      method: methodValue,
      apiUrl: `/api/admin/notes/${noteId}`,
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/admin/notes/${noteId}/edit`}
        onClick={handleEditClick}
        className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
      >
        Edit
      </Link>

      <Link
        href={`/admin/notes/${noteId}/preview`}
        onClick={handlePreviewClick}
        className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white"
      >
        Preview
      </Link>

      <form action={`/api/admin/notes/${noteId}`} method="POST">
        <input type="hidden" name="_method" value={methodValue} />
        <button
          type="submit"
          onClick={handleArchiveToggleClick}
          className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
        >
          {actionLabel}
        </button>
      </form>
    </div>
  );
}
