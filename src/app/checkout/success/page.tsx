import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const { order } = await searchParams;
  const orderNumber = Array.isArray(order) ? order[0] : order;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-labelashb-h2 text-labelashb-ink">Thank you</h1>
      <p className="mt-4 text-labelashb-body text-labelashb-ink-soft">
        {orderNumber
          ? `Your order ${orderNumber} is confirmed. We will be in touch with dispatch details.`
          : "Your order is confirmed."}
      </p>
      <Button href="/products" variant="primary" className="mt-8">
        Continue shopping
      </Button>
    </div>
  );
}
