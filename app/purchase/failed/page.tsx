import Link from "next/link";

export default function FailedPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[30px] border border-red-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-4xl font-black text-slate-900">Payment wasn&apos;t completed.</h1>
        <p className="mt-3 text-slate-600">Don&apos;t worry — your notes are still here.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/notes" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">Try Again</Link>
        </div>
      </div>
    </main>
  );
}
