import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CirclePlay,
  IndianRupee,
  NotebookText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getRecentPublishedNotes, getSubjectCount } from "@/lib/data";
import { StudyPlannerCalendar } from "@/components/study-planner-calendar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recent = await getRecentPublishedNotes(3);
  const [bioCount, chemCount] = await Promise.all([
    getSubjectCount("Biology"),
    getSubjectCount("Chemistry"),
  ]);

  const subjectCards = [
    {
      name: "Biology",
      subtitle: "Handwritten Biology notes for focused NEET preparation.",
      count: bioCount,
    },
    {
      name: "Chemistry",
      subtitle: "Chapter-wise handwritten Chemistry notes for quick revision.",
      count: chemCount,
    },
  ];

  return (
    <main className="bg-[#f7f8fb] text-slate-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-slate-900">
            NEET Notes 2027
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/notes" className="hover:text-slate-900">Notes</Link>
            <Link href="/how-it-works" className="hover:text-slate-900">How It Works</Link>
            <Link href="/faq" className="hover:text-slate-900">FAQ</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" /> NEET Topper Handwritten Notes for NEET 2027
          </div>
          <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Your NEET Revision, Simplified.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Clear, exam-focused handwritten notes designed to help you revise important concepts faster and prepare with confidence.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/notes"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-500"
            >
              Explore Handwritten Notes <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <CirclePlay className="h-4 w-4" /> How It Works
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Handwritten Notes",
              "NEET 2027 Focused",
              "2-Page Free Preview",
              "Only ₹49 Per Note",
              "Instant Download After Payment",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
              >
                <Check className="h-4 w-4 text-emerald-600 shrink-0" /> {item}
              </div>
            ))}
          </div>
        </div>

          <StudyPlannerCalendar />
      </section>

      {/* Subjects Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Subjects</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Choose your subject</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {subjectCards.map((subject) => (
            <div
              key={subject.name}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                {subject.count} published {subject.count === 1 ? "note" : "notes"}
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{subject.name}</h3>
              <p className="mt-3 text-slate-600">{subject.subtitle}</p>
              <Link
                href={`/notes?subject=${encodeURIComponent(subject.name)}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Explore {subject.name} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Published Notes (backed strictly by database) */}
      {recent.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Available notes</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Recently published chapters</h2>
            </div>
            <Link href="/notes" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              View all notes
            </Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {recent.map((note) => (
              <Link
                href={`/notes/${note.id}`}
                key={note.id}
                className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                    Handwritten notes
                  </span>
                  <span className="text-sm font-bold text-slate-900">₹{note.price}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{note.chapterName || note.title}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {note.subject.name} • {note.category.name}
                </p>
                <p className="mt-3 line-clamp-3 text-sm text-slate-600">{note.description}</p>
                <div className="mt-5 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>{note.pageCount} pages</span>
                  <span>2-page free preview</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Value Proposition */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Why students love these notes</p>
            <h2 className="mt-3 text-3xl font-bold">Built for focused, faster revision.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {[
              { icon: NotebookText, title: "Handwritten", text: "Easy-to-read handwritten notes designed for focused revision." },
              { icon: BadgeCheck, title: "NEET 2027 Focused", text: "Organized around the needs of NEET aspirants." },
              { icon: ShieldCheck, title: "2-Page Free Preview", text: "See the notes before you buy." },
              { icon: IndianRupee, title: "₹49", text: "Affordable chapter-wise pricing." },
              { icon: Sparkles, title: "Instant Download", text: "Get access to your full notes after successful payment." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[26px] border border-slate-700 bg-slate-800/70 p-5">
                <div className="mb-4 inline-flex rounded-xl bg-white/10 p-2.5">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">How it works</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Three simple steps.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { number: "01", title: "Choose your chapter", text: "Find the topic you want to revise from Biology or Chemistry." },
            { number: "02", title: "Preview 2 pages", text: "Check the handwriting quality and content depth before buying." },
            { number: "03", title: "Buy for ₹49 & Download", text: "Complete notes become available immediately after verified payment." },
          ].map((step) => (
            <div key={step.number} className="rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Questions students ask</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["How much does one note cost?", "Each individual chapter note costs ₹49."],
              ["Can I preview the notes before buying?", "Yes. You can preview the first two pages before purchasing."],
              ["Do I need an account?", "No. You can browse and purchase notes without creating an account."],
              ["When can I download the notes?", "After successful payment verification, the full PDF becomes available for download immediately."],
              ["Are the notes handwritten?", "Yes. The platform is designed specifically for handwritten NEET preparation notes."],
              ["Which subjects are available?", "Biology (Botany, Zoology) and Chemistry (Physical, Organic, Inorganic). Absolutely no Physics."],
            ].map(([question, answer]) => (
              <div key={question} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-base font-semibold text-slate-900">{question}</h3>
                <p className="mt-2 text-sm text-slate-600">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900">NEET Notes 2027</h3>
            <p className="mt-3 max-w-sm text-sm text-slate-600">Handwritten notes for smarter NEET preparation.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/notes">Notes</Link></li>
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/refund-policy">Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Support</h4>
            <p className="mt-3 text-sm text-slate-600">Need help? Reach out for study note support.</p>
          </div>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-sm text-slate-500">
          © 2026 NEET Notes 2027 • Biology &amp; Chemistry Notes
        </div>
      </footer>
    </main>
  );
}
