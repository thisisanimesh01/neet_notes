import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getOrdersAdmin } from "@/lib/data";

export default async function AdminOrdersPage() {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  const orders = await getOrdersAdmin();

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Orders</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Recent purchases</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Dashboard</Link>
            <Link href="/admin/notes" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Notes</Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length ? orders.map((order: {
                  id: string;
                  orderId: string;
                  customerName: string;
                  customerEmail: string;
                  amount: number;
                  status: string;
                  createdAt: Date;
                  note: { title: string };
                }) => (
                  <tr key={order.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-900">{order.orderId}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="font-medium text-slate-800">{order.customerName}</div>
                      <div className="text-xs text-slate-500">{order.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{order.note.title}</td>
                    <td className="px-4 py-3 text-slate-600">₹{order.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                        order.status === "PAID"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{new Date(order.createdAt).toLocaleString("en-IN")}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">No purchases recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
