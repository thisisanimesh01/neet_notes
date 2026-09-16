export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Legal</p>
        <h1 className="mt-3 text-4xl font-black">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: September 2026</p>

        <div className="mt-8 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-slate-900">1. Who We Are</h2>
            <p className="mt-3 leading-relaxed">
              NEET Notes 2027 is an online platform that sells handwritten, chapter-wise PDF notes for NEET Biology and
              Chemistry preparation at ₹49 per note. We are committed to protecting the privacy of every visitor and
              customer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">2. Information We Collect</h2>
            <p className="mt-3 leading-relaxed">
              We collect only the information necessary to process your purchase and deliver your product:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
              <li>
                <strong>Name and email address</strong> — provided at checkout to identify your purchase and send order
                confirmation.
              </li>
              <li>
                <strong>Payment information</strong> — processed entirely by Razorpay. We do not store your card number,
                UPI ID, or bank account details on our servers.
              </li>
              <li>
                <strong>Order details</strong> — the note purchased, amount paid, and Razorpay order/payment IDs, stored
                to fulfil your download access.
              </li>
              <li>
                <strong>Device and usage data</strong> — standard server logs (IP address, browser type, pages visited)
                for security and analytics. We do not sell this data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">3. How We Use Your Information</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
              <li>To verify payment and grant access to your purchased PDF.</li>
              <li>To respond to support queries sent through our contact page.</li>
              <li>To maintain records required for tax and financial compliance.</li>
              <li>To detect and prevent fraud or abuse.</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              We do not use your information for marketing without your consent, and we do not share it with third
              parties except as described in Section 4.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">4. Third-Party Services</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
              <li>
                <strong>Razorpay</strong> — processes payments. Subject to{" "}
                <a
                  href="https://razorpay.com/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 underline"
                >
                  Razorpay&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Vercel</strong> — hosts the website. Subject to Vercel&apos;s privacy practices.
              </li>
              <li>
                <strong>Supabase</strong> — stores PDF files securely on private, access-controlled servers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">5. Data Retention</h2>
            <p className="mt-3 leading-relaxed">
              Purchase records are retained for a minimum of five years for financial and tax compliance. Server logs
              are retained for up to 90 days. You may request deletion of your personal data (name, email) by contacting
              us — subject to legal retention obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">6. Security</h2>
            <p className="mt-3 leading-relaxed">
              All communications are encrypted via HTTPS. PDF files are stored in private, access-controlled cloud
              storage and are only delivered after server-side payment verification. We do not store payment credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">7. Your Rights</h2>
            <p className="mt-3 leading-relaxed">
              You may request access to, correction of, or deletion of your personal data by contacting us via the{" "}
              <a href="/contact" className="text-emerald-700 underline">
                Contact page
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">8. Cookies</h2>
            <p className="mt-3 leading-relaxed">
              We use a single session cookie for admin authentication. No tracking or advertising cookies are used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">9. Contact</h2>
            <p className="mt-3 leading-relaxed">
              For privacy-related questions, use our{" "}
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
