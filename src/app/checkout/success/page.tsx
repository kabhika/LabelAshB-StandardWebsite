import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/Button";
import { readReceipt, RECEIPT_COOKIE } from "@/lib/orders/receipt";

export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage() {
  const receipt = (await cookies()).get(RECEIPT_COOKIE)?.value;
  const orderNumber = readReceipt(receipt, process.env.RAZORPAY_KEY_SECRET);

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <h1 className="text-labelashb-h2 text-labelashb-ink">
        {orderNumber ? "Order confirmed" : "Order status"}
      </h1>
      <p className="mt-4 text-labelashb-body text-labelashb-ink-soft">
        {orderNumber
          ? `Your order ${orderNumber} is confirmed. We will be in touch with dispatch details.`
          : "There’s no recent order confirmation in this browser. If you’ve paid and need help, contact us."}
      </p>
      <Button href={orderNumber ? "/products" : "/contact"} variant="primary" className="mt-8">
        {orderNumber ? "Continue shopping" : "Contact Label AshB"}
      </Button>
    </main>
  );
}
