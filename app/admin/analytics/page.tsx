import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDashboardStats, getTopSellingNotes } from "@/lib/data";
import { BarChart3, CircleDollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  const stats = await getDashboardStats();
  const topNotes = await getTopSellingNotes(5);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Analytics</p>
            <h1 className="mt-2 text-3xl font-black">Performance overview</h1>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between"><span className="text-sm text-slate-500">Total revenue</span><CircleDollarSign className="h-5 w-5 text-emerald-600" /></div>
            <div className="text-3xl font-black">₹{(stats.revenue || 0).toLocaleString("en-IN")}</div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between"><span className="text-sm text-slate-500">Total orders</span><BarChart3 className="h-5 w-5 text-sky-600" /></div>
            <div className="text-3xl font-black">{stats.orders}</div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between"><span className="text-sm text-slate-500">Notes sold</span><BarChart3 className="h-5 w-5 text-violet-600" /></div>
            <div className="text-3xl font-black">{stats.successfulPayments}</div>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Top-selling notes</h2>
          <div className="mt-5 space-y-3">
            {topNotes.length ? topNotes.map((note: {
              id: string;
              title: string;
              subject: { name: string };
              category: { name: string };
              sales: number;
            }) => (
              <div key={note.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <div className="font-semibold text-slate-900">{note.title}</div>
                  <div className="text-sm text-slate-500">{note.subject.name} • {note.category.name}</div>
                </div>
                <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">{note.sales} sales</div>
              </div>
            )) : <p className="text-slate-600">No paid purchases yet.</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
