import Link from "next/link";
import { CheckCircle2, Download } from "lucide-react";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ noteId?: string; orderId?: string; email?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const noteId = params.noteId ?? "";
  const orderId = params.orderId ?? "";
  const email = params.email ?? "";

  const downloadUrl = noteId ? `/api/notes/${noteId}/download?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}` : "/notes";

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[30px] border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></div>
        <h1 className="mt-6 text-4xl font-black">🎉 Payment Successful!</h1>
        <p className="mt-3 text-lg text-slate-600">Your notes are ready.</p>
        <div className="mt-8 rounded-[22px] border border-slate-200 bg-slate-50 p-5 text-left">
          <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Note ID</span><span className="font-semibold text-slate-900">{noteId || "—"}</span></div>
          <div className="mt-3 flex items-center justify-between"><span className="text-sm text-slate-500">Amount Paid</span><span className="font-semibold text-slate-900">₹49</span></div>
          <div className="mt-3 flex items-center justify-between"><span className="text-sm text-slate-500">Order ID</span><span className="font-semibold text-slate-900">{orderId || "—"}</span></div>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/notes" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Browse more notes</Link>
          <Link href={downloadUrl} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500"><Download className="h-4 w-4" /> Download Full Notes</Link>
        </div>
        <p className="mt-6 text-sm text-slate-600">Keep this page or check your email for your purchase details.</p>
      </div>
    </main>
  );
}
