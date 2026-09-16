"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, Sparkles } from "lucide-react";

type RazorpayCheckoutPayload = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type NoteDetails = {
  id: string;
  title: string;
  chapterName: string;
  description: string;
  pageCount: number;
  price: number;
  subject: { name: string };
  category: { name: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      prefill?: { name?: string; email?: string };
      handler: (response: RazorpayCheckoutPayload) => void;
      modal?: { ondismiss?: () => void };
      theme?: { color: string };
    }) => {
      open: () => void;
    };
  }
}

function PurchasePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = searchParams.get("noteId") ?? "";

  const [note, setNote] = useState<NoteDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNote = async () => {
      if (!noteId) {
        setPageLoading(false);
        setError("No note selected. Please choose a chapter from the notes catalog.");
        return;
      }

      try {
        const response = await fetch(`/api/notes/${encodeURIComponent(noteId)}`);
        const data = await response.json();

        if (!response.ok || !data.ok || !data.note) {
          throw new Error(data.error || "This note is currently unavailable or has been archived.");
        }

        setNote(data.note);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Note unavailable.");
      } finally {
        setPageLoading(false);
      }
    };

    loadNote();
  }, [noteId]);

  useEffect(() => {
    const existingScript = document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']");
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  async function handleCheckout() {
    if (!noteId || !note) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Unable to start checkout.");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout script failed to load. Please refresh and try again.");
      }

      const razorpay = new window.Razorpay({
        key: result.key,
        amount: result.amount,
        currency: result.currency,
        name: "NEET Notes 2027",
        description: `Handwritten Notes: ${note.chapterName || note.title}`,
        order_id: result.orderId,
        handler: async function (paymentResponse: RazorpayCheckoutPayload) {
          try {
            const verifyResponse = await fetch("/api/purchase/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                noteId,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyResult = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyResult.ok) {
              throw new Error(verifyResult.error || "Payment verification failed.");
            }

            router.push(
              `/purchase/success?noteId=${encodeURIComponent(noteId)}&orderId=${encodeURIComponent(result.orderId)}`
            );
          } catch (checkoutError) {
            console.error(checkoutError);
            setError("Payment verification was not completed. If money was deducted, please contact support.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment was cancelled. You have not been charged.");
            setLoading(false);
          },
        },
        theme: {
          color: "#059669",
        },
      });

      razorpay.open();
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <Link
          href="/notes"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all notes
        </Link>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Order Checkout</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">You&apos;re getting:</h1>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> Instant PDF
            </div>
          </div>

          {pageLoading ? (
            <div className="my-8 rounded-[22px] border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Loading note details...
            </div>
          ) : note ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded-md bg-slate-200/80 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      {note.subject.name} • {note.category.name}
                    </span>
                    <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                      {note.chapterName || note.title}
                    </h2>
                    {note.title && note.title !== note.chapterName ? (
                      <p className="mt-1 text-sm font-medium text-slate-600">{note.title}</p>
                    ) : null}
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{note.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-slate-900">₹{note.price}</p>
                    <p className="text-[11px] text-slate-500">One-time payment</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-200/80 pt-4 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-slate-500" /> {note.pageCount} Pages Full PDF
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Handwritten Notes
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Immediate Download
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 text-xs text-slate-500">
                <div className="flex justify-between py-1">
                  <span>Note Item:</span>
                  <span className="font-semibold text-slate-700">{note.chapterName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Delivery method:</span>
                  <span className="font-semibold text-slate-700">Digital Download (PDF)</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 py-1 pt-2 font-bold text-slate-900">
                  <span>Total Amount:</span>
                  <span className="text-base text-emerald-700">₹{note.price}</span>
                </div>
              </div>

              {error ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Processing..." : `Pay ₹${note.price} & Download`}
              </button>
            </div>
          ) : (
            <div className="my-6 rounded-[22px] border border-amber-200 bg-amber-50 p-6 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
              <h2 className="mt-3 text-base font-bold text-amber-900">Note Unavailable</h2>
              <p className="mt-2 text-sm text-amber-800">
                {error || "The selected note could not be found or has not been published yet."}
              </p>
              <div className="mt-5">
                <Link
                  href="/notes"
                  className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Browse Available Notes
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PurchasePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f8fb] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl rounded-[30px] border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
            Loading checkout...
          </div>
        </main>
      }
    >
      <PurchasePageContent />
    </Suspense>
  );
}
