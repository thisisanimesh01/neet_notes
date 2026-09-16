export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Legal</p>
        <h1 className="mt-3 text-4xl font-black">Terms &amp; Conditions</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: September 2026</p>

        <div className="mt-8 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-slate-900">1. About the Platform</h2>
            <p className="mt-3 leading-relaxed">
              NEET Notes 2027 sells handwritten, chapter-wise PDF notes for NEET Biology and Chemistry at ₹49 per
              chapter. By accessing or using this website, you agree to these Terms &amp; Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">2. Product Description</h2>
            <p className="mt-3 leading-relaxed">
              All notes are digital PDF files delivered electronically. Each note covers one chapter from Biology
              (Botany or Zoology) or Chemistry (Physical, Organic, or Inorganic). No physical product is shipped.
            </p>
            <p className="mt-3 leading-relaxed">
              A free 2-page preview is available before purchase. The full PDF is accessible after confirmed payment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">3. Pricing</h2>
            <p className="mt-3 leading-relaxed">
              Each note is priced at <strong>₹49 (Rupees Forty-Nine)</strong>, inclusive of all applicable taxes. There
              are no subscription plans or bundles. You pay only for the notes you choose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">4. Payment</h2>
            <p className="mt-3 leading-relaxed">
              Payments are processed by Razorpay. By making a purchase, you also agree to Razorpay&apos;s terms and
              conditions. We do not store your payment credentials.
            </p>
            <p className="mt-3 leading-relaxed">
              Access to the full PDF is granted only after server-side payment verification. A payment confirmation from
              the browser alone does not constitute proof of payment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">5. Digital Delivery</h2>
            <p className="mt-3 leading-relaxed">
              After successful payment, you may download the full PDF immediately from your purchase confirmation page.
              The download link is associated with your order. If you experience any issue accessing your download,
              contact us with your Razorpay order ID.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">6. Refunds &amp; Cancellations</h2>
            <p className="mt-3 leading-relaxed">
              Please refer to our{" "}
              <a href="/refund-policy" className="text-emerald-700 underline">
                Refund &amp; Cancellation Policy
              </a>{" "}
              for complete details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">7. Intellectual Property</h2>
            <p className="mt-3 leading-relaxed">
              All notes and content are the intellectual property of NEET Notes 2027. Purchasing a note grants you a
              personal, non-transferable licence for individual revision use only. You may not:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
              <li>Redistribute, resell, or share the PDF files.</li>
              <li>Upload notes to any public platform, file-sharing service, or group.</li>
              <li>Reproduce the content for commercial purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">8. Acceptable Use</h2>
            <p className="mt-3 leading-relaxed">
              You agree to use the website for lawful purposes only. You must not attempt to circumvent payment
              verification, access files without a valid purchase, or interfere with the security of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">9. Disclaimer</h2>
            <p className="mt-3 leading-relaxed">
              Notes are provided for personal study assistance. We do not guarantee specific exam results. The content
              reflects the author&apos;s understanding and is intended as a supplement to official NEET study materials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">10. Changes to Terms</h2>
            <p className="mt-3 leading-relaxed">
              We reserve the right to update these Terms. The &quot;Last updated&quot; date above will reflect any
              changes. Continued use of the platform constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">11. Contact</h2>
            <p className="mt-3 leading-relaxed">
              For any questions about these Terms, please use our{" "}
              <a href="/contact" className="text-emerald-700 underline">
                Contact page
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
