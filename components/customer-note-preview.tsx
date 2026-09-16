"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type CustomerNotePreviewProps = {
  noteId: string;
  previewUrl: string;
  totalPages: number;
  price: number;
};

export function CustomerNotePreview({
  noteId,
  previewUrl,
  totalPages,
  price,
}: CustomerNotePreviewProps) {
  const visiblePages = Math.min(2, totalPages);
  const lockedPages = Array.from({ length: Math.max(totalPages - 2, 0) }, (_, index) => index + 3);
  const previewPageWidth = 380;

  return (
    <div className="mt-10 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Preview</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">
            {visiblePages} / {totalPages} pages
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          Safe preview
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Page 1</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex justify-center overflow-hidden">
              <Document
                file={previewUrl}
                loading={<div className="flex h-[360px] w-full items-center justify-center text-sm text-slate-500">Loading preview…</div>}
                error={<div className="flex h-[360px] w-full items-center justify-center text-sm text-red-600">Preview unavailable.</div>}
              >
                <Page
                  pageNumber={1}
                  width={previewPageWidth}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  className="mx-auto"
                  loading={<div className="h-[360px] w-[380px] bg-slate-100" />}
                />
              </Document>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Page 2</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex justify-center overflow-hidden">
              <Document
                file={previewUrl}
                loading={<div className="flex h-[360px] w-full items-center justify-center text-sm text-slate-500">Loading preview…</div>}
                error={<div className="flex h-[360px] w-full items-center justify-center text-sm text-red-600">Preview unavailable.</div>}
              >
                <Page
                  pageNumber={2}
                  width={previewPageWidth}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  className="mx-auto"
                  loading={<div className="h-[360px] w-[380px] bg-slate-100" />}
                />
              </Document>
            </div>
          </div>
        </div>

        {lockedPages.map((pageNumber) => (
          <div
            key={pageNumber}
            className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Page {pageNumber} of {totalPages}
            </div>
            <div className="relative">
              <img
                src={`/api/notes/${noteId}/locked-preview/${pageNumber}`}
                alt={`Locked page ${pageNumber} preview`}
                className="h-[260px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/25" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                <div className="rounded-full border border-white/60 bg-white/15 p-4 text-white shadow-lg backdrop-blur-[2px]">
                  <Lock className="h-8 w-8" />
                </div>
                <p className="mt-4 text-lg font-bold text-white">Page locked</p>
                <p className="mt-1 text-sm text-slate-100">Purchase to unlock</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <a
          href={`/purchase?noteId=${noteId}`}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-500"
        >
          <ShieldCheck className="h-4 w-4" />
          Get Full Notes — ₹{price}
        </a>
      </div>

      <div className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-slate-500">
        Unlock all {totalPages} pages
      </div>
    </div>
  );
}
