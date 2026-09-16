import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, FileText, LayoutDashboard, PackageCheck, ShoppingBag, ShieldCheck } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDashboardStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  const stats = await getDashboardStats();

  const cards = [
    { label: "Total Notes", value: stats.totalNotes, icon: FileText },
    { label: "Published Notes", value: stats.publishedNotes, icon: PackageCheck },
    { label: "Draft Notes", value: stats.draftNotes, icon: LayoutDashboard },
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag },
    { label: "Successful Payments", value: stats.successfulPayments, icon: ShieldCheck },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <aside className="mb-6 flex flex-col gap-3 rounded-2xl bg-slate-900 p-4 text-slate-100 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin Portal</p>
            <h1 className="mt-1 text-2xl font-bold">NEET Notes 2027</h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link href="/admin" className="rounded-lg bg-slate-700 px-3 py-2">Dashboard</Link>
            <Link href="/admin/notes" className="rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800">Notes</Link>
            <Link href="/admin/orders" className="rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800">Orders</Link>
            <Link href="/admin/analytics" className="rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800">Analytics</Link>
            <Link href="/admin/settings" className="rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800">Settings</Link>
            <form action="/api/admin/logout" method="POST">
              <button className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800">Logout</button>
            </form>
          </nav>
        </aside>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-slate-500">{card.label}</span>
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">{card.value}</div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          <Link href="/admin/notes/new" className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-left shadow-sm hover:border-slate-400">
            <div className="text-lg font-semibold text-slate-900">+ Add New Note</div>
            <p className="mt-2 text-sm text-slate-600">Upload a handwritten PDF and publish it instantly.</p>
          </Link>
          <Link href="/admin/notes" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300">
            <div className="text-lg font-semibold text-slate-900">Manage Notes</div>
            <p className="mt-2 text-sm text-slate-600">Review, edit, publish, or archive notes.</p>
          </Link>
          <Link href="/admin/orders" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300">
            <div className="text-lg font-semibold text-slate-900">View Orders</div>
            <p className="mt-2 text-sm text-slate-600">Track purchases, payments, and customer records.</p>
          </Link>
          <Link href="/admin/analytics" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300">
            <div className="text-lg font-semibold text-slate-900">Analytics</div>
            <p className="mt-2 text-sm text-slate-600">Monitor revenue and best-performing notes.</p>
          </Link>
        </section>
      </div>
    </div>
  );
}
