import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin/auth";
import { adminLogin, adminLogout } from "../actions";
import { AutoRefresh } from "./AutoRefresh";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Orders admin",
  robots: { index: false, follow: false },
};

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  status: string;
  payment_status: string;
  notified_at: string | null;
  created_at: string;
  order_items: { product_title: string; variant_title: string; quantity: number }[];
}

interface LogRow {
  id: string;
  channel: string;
  recipient: string;
  status: string;
  error: string | null;
  created_at: string;
  orders: { order_number: string } | null;
}

function ist(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; show?: string }>;
}) {
  const params = await searchParams;

  if (!(await isAdmin())) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-sm px-4 py-20">
        <h1 className="text-labelashb-h2 text-labelashb-ink">Orders admin</h1>
        {!process.env.ADMIN_PASSWORD ? (
          <p className="mt-4 text-labelashb-body text-labelashb-ink-soft">
            Orders administration is currently unavailable.
          </p>
        ) : (
          <form action={adminLogin} className="mt-6 space-y-3">
            <label htmlFor="admin-password" className="block">Password</label>
            <input
              id="admin-password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-labelashb-border bg-transparent px-3 py-2"
            />
            {params.error && <p role="alert" className="text-sm text-red-700">Incorrect password.</p>}
            <button type="submit" className="w-full rounded-md bg-labelashb-ink px-3 py-2 text-white">
              Sign in
            </button>
          </form>
        )}
      </main>
    );
  }

  const showAll = params.show === "all";
  let query = supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, total, status, payment_status, notified_at, created_at, order_items(product_title, variant_title, quantity)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (!showAll) query = query.eq("payment_status", "captured");

  const [{ data: orders }, { data: logs }, { count: leadCount }, { data: summaryRows }] = await Promise.all([
    query,
    supabaseAdmin
      .from("notification_log")
      .select("id, channel, recipient, status, error, created_at, orders(order_number)")
      .order("created_at", { ascending: false })
      .limit(30),
    supabaseAdmin.from("leads").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("orders").select("total, payment_status, status"),
  ]);

  const rows = (orders ?? []) as unknown as OrderRow[];
  const logRows = (logs ?? []) as unknown as LogRow[];
  const paid = (summaryRows ?? []).filter((r) => r.payment_status === "captured");
  const revenue = paid.reduce((s, r) => s + Number(r.total), 0);
  const failedAlerts = logRows.filter((l) => l.status === "failed").length;

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl px-4 py-10">
      <AutoRefresh seconds={30} />
      <div className="flex items-center justify-between">
        <h1 className="text-labelashb-h2 text-labelashb-ink">Orders</h1>
        <form action={adminLogout}>
          <button className="text-sm underline" type="submit">
            Sign out
          </button>
        </form>
      </div>
      <p className="mt-1 text-sm text-labelashb-ink-soft">Updates every 30 seconds. Times in IST.</p>

      <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["Paid orders", String(paid.length)],
          ["Revenue", `Rs ${revenue.toLocaleString("en-IN")}`],
          ["Newsletter and restock leads", String(leadCount ?? 0)],
          ["Failed alerts (last 30)", String(failedAlerts)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-md border border-labelashb-border p-4">
            <dt className="text-xs uppercase tracking-wide text-labelashb-ink-soft">{k}</dt>
            <dd className="mt-1 text-xl text-labelashb-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex items-center gap-4 text-sm">
        <a href="/admin/orders" className={showAll ? "underline" : "font-semibold"}>
          Paid only
        </a>
        <a href="/admin/orders?show=all" className={showAll ? "font-semibold" : "underline"}>
          All including abandoned
        </a>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-labelashb-border text-labelashb-ink-soft">
              <th className="py-2 pr-3">Order</th>
              <th className="pr-3">When</th>
              <th className="pr-3">Customer</th>
              <th className="pr-3">Items</th>
              <th className="pr-3">Total</th>
              <th className="pr-3">Status</th>
              <th>Alerted</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-labelashb-ink-soft">
                  No orders yet.
                </td>
              </tr>
            )}
            {rows.map((o) => (
              <tr key={o.id} className="border-b border-labelashb-border align-top">
                <td className="py-2 pr-3 font-medium">{o.order_number}</td>
                <td className="pr-3">{ist(o.created_at)}</td>
                <td className="pr-3">
                  {o.customer_name}
                  <br />
                  <span className="text-labelashb-ink-soft">{o.customer_phone}</span>
                </td>
                <td className="pr-3">
                  {o.order_items.map((i, n) => (
                    <div key={n}>
                      {i.product_title} ({i.variant_title}) x {i.quantity}
                    </div>
                  ))}
                </td>
                <td className="pr-3">Rs {Number(o.total).toLocaleString("en-IN")}</td>
                <td className="pr-3">
                  {o.status} / {o.payment_status}
                </td>
                <td>{o.notified_at ? ist(o.notified_at) : o.payment_status === "captured" ? "not yet" : "n/a"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-lg text-labelashb-ink">Alert log</h2>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-labelashb-border text-labelashb-ink-soft">
              <th className="py-2 pr-3">When</th>
              <th className="pr-3">Order</th>
              <th className="pr-3">Channel</th>
              <th className="pr-3">To</th>
              <th className="pr-3">Result</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {logRows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-labelashb-ink-soft">
                  No alerts sent yet.
                </td>
              </tr>
            )}
            {logRows.map((l) => (
              <tr key={l.id} className="border-b border-labelashb-border align-top">
                <td className="py-2 pr-3">{ist(l.created_at)}</td>
                <td className="pr-3">{l.orders?.order_number ?? ""}</td>
                <td className="pr-3">{l.channel}</td>
                <td className="pr-3">{l.recipient}</td>
                <td className="pr-3">{l.status}</td>
                <td className="text-labelashb-ink-soft">{l.error ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
