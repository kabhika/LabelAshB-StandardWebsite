import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ORDER_HISTORY_COOKIE, readOrderHistory } from "@/lib/orders/browser-history";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "My orders",
  robots: { index: false, follow: false },
  alternates: { canonical: "/my-orders" },
};

const orderDate = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

const statusLabels: Record<string, string> = {
  paid: "Payment confirmed",
  pending: "Pending",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default async function MyOrdersPage() {
  const cookie = (await cookies()).get(ORDER_HISTORY_COOKIE)?.value;
  const ids = readOrderHistory(cookie, process.env.RAZORPAY_KEY_SECRET);
  const { data: orders, error } = ids.length
    ? await supabaseAdmin
        .from("orders")
        .select("id, order_number, status, created_at, order_items(product_title, variant_title, quantity)")
        .in("id", ids)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-labelashb-h1 text-labelashb-ink">My orders</h1>
      <p className="mt-3 text-labelashb-body text-labelashb-ink-soft">
        View recent orders you placed using this browser.
      </p>
      {error ? (
        <p role="alert" className="mt-8">We couldn’t load your orders. Please try again.</p>
      ) : orders?.length ? (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border border-labelashb-border p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-labelashb-h3">{order.order_number}</h2>
                <p className="font-medium">{statusLabels[order.status] ?? "Contact us for an update"}</p>
              </div>
              <p className="mt-1 text-labelashb-small text-labelashb-ink-soft">
                <time dateTime={order.created_at}>{orderDate.format(new Date(order.created_at))}</time>
              </p>
              <ul className="mt-4 space-y-2">
                {order.order_items.map((item, index) => (
                  <li key={index}>{item.product_title} · {item.variant_title} · Qty {item.quantity}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 border border-labelashb-border p-5">There are no saved orders in this browser.</p>
      )}
      <p className="mt-8 text-labelashb-body text-labelashb-ink-soft">
        Looking for an older order, an order from another device, or courier tracking?{" "}
        <Link href="/contact" className="font-medium text-labelashb-ink underline underline-offset-2">Contact us</Link>
        {" "}with your order number.
      </p>
      <Button href="/products" variant="secondary" className="mt-5">Continue shopping</Button>
    </main>
  );
}
