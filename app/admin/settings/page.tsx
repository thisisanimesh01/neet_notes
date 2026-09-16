import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminSettingsPage() {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  const storageProvider = process.env.STORAGE_PROVIDER === "supabase" ? "Supabase Private Storage" : "Local Private Storage";
  const paymentMode = process.env.RAZORPAY_KEY_ID?.startsWith("rzp_live") ? "Razorpay LIVE" : "Razorpay TEST";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Settings</p>
          <h1 className="mt-2 text-3xl font-black">Application settings</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-xl font-bold">Admin Portal</h2>
            <p className="mt-3 text-sm text-slate-600">
              Authenticated session active. Admin credentials are configured through server-side environment variables.
            </p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-xl font-bold">Storage status</h2>
            <p className="mt-3 text-sm text-slate-600">
              Provider: {storageProvider}. Full PDF files are stored privately and delivered only upon verified purchase.
            </p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-xl font-bold">Payment configuration</h2>
            <p className="mt-3 text-sm text-slate-600">
              Gateway: {paymentMode}. Fixed pricing at ₹49 per note.
            </p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-xl font-bold">Application info</h2>
            <p className="mt-3 text-sm text-slate-600">
              NEET Notes 2027 • Biology (Botany, Zoology) and Chemistry (Physical, Organic, Inorganic).
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
