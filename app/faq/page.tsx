import Link from "next/link";

export default function FAQPage() {
  const items = [
    ["How much does one note cost?", "Each individual note costs ₹49."],
    ["Can I preview the notes before buying?", "Yes. You can preview the first two pages before purchasing."],
    ["Do I need an account?", "No. You can browse and purchase notes without creating an account."],
    ["When can I download the notes?", "After successful payment verification, the full PDF becomes available for download."],
    ["Are the notes handwritten?", "Yes. The platform is designed specifically for handwritten NEET preparation notes."],
    ["Which subjects are available?", "Biology and Chemistry, with notes organized by category and chapter."],
  ];

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">FAQ</p>
          <h1 className="mt-3 text-4xl font-black">Frequently asked questions</h1>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {items.map(([question, answer]) => (
            <div key={question} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">{question}</h2>
              <p className="mt-3 text-slate-600">{answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/notes" className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">Explore notes</Link>
        </div>
      </div>
    </main>
  );
}
