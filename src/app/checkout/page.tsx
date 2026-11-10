"use client";

import { useState, type FormEvent } from "react";
import Script from "next/script";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/Button";

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function formatPrice(amount: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

const inputClass =
  "w-full border border-labelashb-border bg-labelashb-ground px-4 py-3 text-labelashb-body text-labelashb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1";

export default function CheckoutPage() {
  const { cart } = useCart();
  const [scriptReady, setScriptReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentNeedsReview, setPaymentNeedsReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const lines = cart?.lines.edges.map((e) => e.node) ?? [];

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting || paymentNeedsReview) return;
    setError(null);

    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!scriptReady) {
      setError("Payment is still loading. Please wait a moment and try again.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail || undefined,
          customerPhone: form.customerPhone,
          shippingAddress: {
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: "India",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Label AshB",
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: data.customerName,
          email: data.customerEmail,
          contact: data.customerPhone,
        },
        theme: { color: "#6b1f2a" },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                supabaseOrderId: data.supabaseOrderId,
                ...response,
              }),
            });
            if (!verifyRes.ok) throw new Error("Order confirmation failed");
            window.location.replace("/checkout/success");
          } catch {
            setPaymentNeedsReview(true);
            setError(
              `We couldn’t confirm your payment. Please don’t pay again. Contact us with payment reference ${response.razorpay_payment_id}.`,
            );
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });

      razorpay.on("payment.failed", () => {
        setError("Payment failed. Please try again or use a different payment method.");
        setSubmitting(false);
      });

      razorpay.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-2xl px-4 py-12">
      {lines.length > 0 && (
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
          onError={() => setError("The payment service couldn’t load. Reload this page to try again.")}
        />
      )}
      <h1 className="text-labelashb-h2 text-labelashb-ink">Checkout</h1>

      {lines.length === 0 ? (
        <p className="mt-6 text-labelashb-body text-labelashb-ink-soft">
          Your cart is empty.{" "}
          <Link href="/products" className="underline">
            Continue shopping
          </Link>.
        </p>
      ) : (
        <>
          <ul className="mt-6 space-y-3 border-b border-labelashb-border pb-6">
            {lines.map((line) => (
              <li
                key={line.id}
                className="flex justify-between text-labelashb-body text-labelashb-ink"
              >
                <span>
                  {line.merchandise.product.title} ({line.merchandise.title}) ×{" "}
                  {line.quantity}
                </span>
                <span className="tabular-nums">
                  {formatPrice(Number(line.merchandise.price.amount) * line.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between text-labelashb-body-lg text-labelashb-ink">
            <span>Subtotal</span>
            <span className="tabular-nums">
              {formatPrice(cart?.cost.subtotalAmount.amount ?? "0")}
            </span>
          </div>
          <p className="mt-1 text-labelashb-small text-labelashb-ink-soft">
            Free shipping within India.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <h2 className="text-labelashb-h3">Delivery details</h2>
            <label className="block space-y-1">
              <span>Full name</span>
              <input
                required
                name="customerName"
                autoComplete="name"
                value={form.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block space-y-1">
              <span>Phone number</span>
              <input
                required
                type="tel"
                name="customerPhone"
                autoComplete="tel"
                value={form.customerPhone}
                onChange={(e) => update("customerPhone", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block space-y-1">
              <span>Email address (optional)</span>
              <input
                type="email"
                name="customerEmail"
                autoComplete="email"
                value={form.customerEmail}
                onChange={(e) => update("customerEmail", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block space-y-1">
              <span>Address line 1</span>
              <input
                required
                name="line1"
                autoComplete="address-line1"
                value={form.line1}
                onChange={(e) => update("line1", e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block space-y-1">
              <span>Address line 2 (optional)</span>
              <input
                name="line2"
                autoComplete="address-line2"
                value={form.line2}
                onChange={(e) => update("line2", e.target.value)}
                className={inputClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span>City</span>
                <input
                  required
                  name="city"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block space-y-1">
                <span>State</span>
                <input
                  required
                  name="state"
                  autoComplete="address-level1"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="block space-y-1">
              <span>PIN code</span>
              <input
                required
                name="pincode"
                autoComplete="postal-code"
                inputMode="numeric"
                pattern="[1-9][0-9]{5}"
                maxLength={6}
                value={form.pincode}
                onChange={(e) => update("pincode", e.target.value)}
                className={inputClass}
              />
            </label>

            {error && (
              <p role="alert" className="text-labelashb-small text-labelashb-error">
                {error}{" "}
                {paymentNeedsReview && <Link href="/contact" className="underline">Contact Label AshB</Link>}
              </p>
            )}

            <Button type="submit" disabled={submitting || paymentNeedsReview || !scriptReady} className="w-full">
              {submitting
                ? "Processing…"
                : !scriptReady ? "Loading payment…" : `Pay ${formatPrice(cart?.cost.totalAmount.amount ?? "0")}`}
            </Button>
          </form>
        </>
      )}
    </main>
  );
}
