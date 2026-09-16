import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-4xl font-black text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you are looking for does not exist.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">Back to home</Link>
      </div>
    </main>
  );
}
