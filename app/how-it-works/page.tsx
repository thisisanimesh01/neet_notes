import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">How it works</p>
          <h1 className="mt-3 text-4xl font-black">Simple, affordable, and student-friendly.</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { number: "01", title: "Choose your chapter", text: "Find the topic you want to revise from Biology or Chemistry." },
            { number: "02", title: "Preview 2 pages", text: "Review the first two pages before deciding to buy the full PDF." },
            { number: "03", title: "Buy for ₹49 & Download", text: "Complete notes unlock after successful payment and can be downloaded instantly." },
          ].map((step) => (
            <div key={step.number} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-black text-emerald-700">{step.number}</div>
              <h2 className="text-xl font-bold text-slate-900">{step.title}</h2>
              <p className="mt-3 text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Why students choose NEET Notes 2027</h2>
          <ul className="mt-4 space-y-3 text-slate-600">
            <li>✓ Handwritten notes designed for quick revision.</li>
            <li>✓ Chapter-wise purchases for just ₹49.</li>
            <li>✓ Preview before you pay.</li>
            <li>✓ Secure download after payment verification.</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link href="/notes" className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">Explore notes</Link>
        </div>
      </div>
    </main>
  );
}
