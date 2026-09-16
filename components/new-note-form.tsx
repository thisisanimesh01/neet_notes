"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const subjectOptions = [
  { label: "Biology", value: "Biology", categories: ["Botany", "Zoology"] },
  { label: "Chemistry", value: "Chemistry", categories: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry"] },
];

export function NewNoteForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("Biology");
  const [categoryOptions, setCategoryOptions] = useState<string[]>(subjectOptions[0].categories);
  const [category, setCategory] = useState("Botany");
  const [chapterName, setChapterName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubjectChange(value: string) {
    const matched = subjectOptions.find((option) => option.value === value);
    if (!matched) return;

    setSubject(value);
    const nextOptions = matched.categories;
    setCategoryOptions(nextOptions);
    setCategory(nextOptions[0]);
  }

  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const fileInput = form.get("file") as File | null;

    if (!fileInput || fileInput.size === 0) {
      alert("Please select a PDF file to upload.");
      return;
    }

    if (!fileInput.name.toLowerCase().endsWith(".pdf")) {
      alert("Only PDF files are allowed.");
      return;
    }

    if (fileInput.size > 50 * 1024 * 1024) {
      alert("File is too large. Maximum allowed size is 50 MB.");
      return;
    }

    setLoading(true);
    setStatusMessage("Requesting secure upload authorization...");

    try {
      // 1. Get server-authorized signed upload URL (bypasses Vercel payload limits)
      const authRes = await fetch("/api/admin/notes/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: fileInput.name,
          fileSize: fileInput.size,
        }),
      });

      const authData = await authRes.json();
      if (!authRes.ok || !authData.signedUrl || !authData.storageKey) {
        throw new Error(authData.error || "Failed to authorize upload.");
      }

      // 2. Direct upload from browser directly to private Supabase Storage
      setStatusMessage("Uploading PDF directly to private storage...");
      const uploadRes = await fetch(authData.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/pdf",
        },
        body: fileInput,
      });

      if (!uploadRes.ok) {
        throw new Error(`Direct storage upload failed (${uploadRes.status} ${uploadRes.statusText})`);
      }

      // 3. Finalize note creation on server (generates preview, creates DB record)
      setStatusMessage("Finalizing note and generating 2-page preview...");
      const finalizeRes = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storageKey: authData.storageKey,
          subject,
          category,
          chapterName,
          title,
          description,
          status,
        }),
      });

      const finalizeData = await finalizeRes.json();
      if (!finalizeRes.ok || !finalizeData.success) {
        throw new Error(finalizeData.error || "Failed to finalize note.");
      }

      setStatusMessage("Complete!");
      router.push("/admin/notes");
      router.refresh();
    } catch (err) {
      console.error("[Add Note Upload Error]:", err);
      const message = err instanceof Error ? err.message : "Upload failed.";
      alert(message);
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</p>
            <h1 className="mt-2 text-3xl font-black">Add a new note</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2" encType="multipart/form-data">
          <div>
            <label className="mb-2 block text-sm font-medium">Subject</label>
            <select
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
            >
              {subjectOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Chapter Name</label>
            <input
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">PDF Upload</label>
            <input
              type="file"
              accept="application/pdf"
              name="file"
              className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
              required
            />
            {fileName ? <p className="mt-2 text-xs text-slate-500">Selected: {fileName}</p> : null}
            {statusMessage ? (
              <p className="mt-2 text-xs font-medium text-emerald-700 animate-pulse">
                {statusMessage}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Price</label>
            <input
              value={49}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-3 text-sm text-slate-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/notes")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-70"
            >
              {loading ? (statusMessage || "Uploading...") : "Upload Note"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
