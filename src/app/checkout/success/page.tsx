import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/Button";
import { GoogleAdsConversion } from "@/components/analytics/GoogleAdsConversion";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { readReceipt, RECEIPT_COOKIE } from "@/lib/orders/receipt";

export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false, follow: false },
};

// Both env vars or nothing: with tracking unconfigured the tag never loads
// and this page must stay exactly as dependency-free as it always was.
const CONVERSION_CONFIGURED =
  Boolean(process.env.NEXT_PUBLIC_GOOGLE_TAG_ID) &&
  Boolean(process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL);

// Orders older than a week never fire a conversion. Success URLs are public
// and order numbers are sequential (LAB-1001...), so without this a buyer
// revisiting an old confirmation from browser history would register a
// phantom (unattributed) conversion, and order-number guessing would have an
// unbounded surface. Recent revisits are fine: the same transaction_id has
// usually already fired and Google de-duplicates it.
const MAX_ORDER_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// A buyer just paid; they must never wait on analytics. If the lookup is
// slow, show the thank-you page anyway and skip the conversion.
const LOOKUP_TIMEOUT_MS = 4000;

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  // Signed receipt cookie set by /api/checkout/verify is the primary source
  // (it never leaks the order number into a public URL); the query param is
  // kept as a fallback for older links.
  const receipt = (await cookies()).get(RECEIPT_COOKIE)?.value;
  const { order } = await searchParams;
  const orderNumber =
    readReceipt(receipt, process.env.RAZORPAY_KEY_SECRET) ??
    (Array.isArray(order) ? order[0] : order);

  // The checkout client only routes here after /api/checkout/verify has
  // accepted the Razorpay signature, but the success URL itself is public -
  // anyone can type it. Re-check server-side that this order number is a
  // real, captured, recent payment before handing its total (in rupees;
  // create-order multiplies by 100 only for Razorpay) to the conversion
  // event. An unknown, pending, failed or stale order renders the same
  // thank-you copy as before and fires nothing.
  let purchaseTotal: number | null = null;
  if (orderNumber && CONVERSION_CONFIGURED) {
    const cutoff = new Date(Date.now() - MAX_ORDER_AGE_MS).toISOString();
    const lookup = (async (): Promise<number | null> => {
      try {
        const res = await supabaseAdmin
          .from("orders")
          .select("total")
          .eq("order_number", orderNumber)
          .eq("payment_status", "captured")
          .gte("created_at", cutoff)
          .maybeSingle();
        return (res.data?.total as number | undefined) ?? null;
      } catch {
        return null;
      }
    })();
    purchaseTotal = await Promise.race([
      lookup,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), LOOKUP_TIMEOUT_MS)),
    ]);
  }

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      {orderNumber && purchaseTotal !== null && (
        <GoogleAdsConversion orderNumber={orderNumber} total={purchaseTotal} />
      )}
      <h1 className="text-labelashb-h2 text-labelashb-ink">
        {orderNumber ? "Order confirmed" : "Order status"}
      </h1>
      <p className="mt-4 text-labelashb-body text-labelashb-ink-soft">
        {orderNumber
          ? `Your order ${orderNumber} is confirmed. We will be in touch with dispatch details.`
          : "There’s no recent order confirmation in this browser. If you’ve paid and need help, contact us."}
      </p>
      <div className="mt-8">
        <Button href={orderNumber ? "/products" : "/contact"} variant="primary">
          {orderNumber ? "Continue shopping" : "Contact Label AshB"}
        </Button>
        {orderNumber && (
          <Button href="/my-orders" variant="secondary" className="ml-3">
            My orders
          </Button>
        )}
      </div>
    </main>
  );
}
