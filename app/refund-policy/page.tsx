export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Legal</p>
        <h1 className="mt-3 text-4xl font-black">Refund &amp; Cancellation Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: September 2026</p>

        <div className="mt-8 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-slate-900">Digital Product — No Refund Policy</h2>
            <p className="mt-3 leading-relaxed">
              NEET Notes 2027 sells digital PDF products that are delivered immediately upon payment confirmation. Because
              the product is a digital file that is accessible and downloadable instantly after purchase, we maintain a{" "}
              <strong>no-refund policy</strong> for all completed transactions.
            </p>
            <p className="mt-3 leading-relaxed">
              By completing a purchase, you acknowledge that you have reviewed the free 2-page preview of the note and
              consent to immediate digital delivery, thereby waiving any right of withdrawal or cancellation that may
              otherwise apply.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Exceptions</h2>
            <p className="mt-3 leading-relaxed">
              A refund may be considered in the following limited circumstances only:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
              <li>
                <strong>Duplicate payment:</strong> If your account was charged more than once for the same note due to
                a technical error on our platform, we will refund the duplicate charge in full.
              </li>
              <li>
                <strong>Payment captured but access not granted:</strong> If Razorpay confirms a successful payment but
                you are unable to download the note despite following the steps on the confirmation page, contact us
                within 7 days with your Razorpay Payment ID.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Cancellations</h2>
            <p className="mt-3 leading-relaxed">
              Orders cannot be cancelled after payment is captured. If you initiated a payment but the transaction did
              not complete (e.g. you closed the payment window), no charge was applied and no cancellation is necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">How to Request a Refund</h2>
            <p className="mt-3 leading-relaxed">
              If you believe you qualify for an exception, please contact us via the{" "}
              <a href="/contact" className="text-emerald-700 underline">
                Contact page
              </a>{" "}
              within <strong>7 days</strong> of the transaction date. Include:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
              <li>Your Razorpay Order ID or Payment ID</li>
              <li>The name of the note purchased</li>
              <li>A description of the issue</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              We will investigate and respond within 5 business days. Approved refunds will be processed back to the
              original payment method within 7–10 business days, subject to Razorpay&apos;s processing timelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Shipping Policy</h2>
            <p className="mt-3 leading-relaxed">
              NEET Notes 2027 sells exclusively digital products. There is no physical shipping. All notes are delivered
              as downloadable PDF files, accessible immediately after confirmed payment through your purchase
              confirmation page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
