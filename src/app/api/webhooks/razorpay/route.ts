// Server-to-server confirmation, separate from /api/checkout/verify.
//
// Why both exist: /api/checkout/verify only runs if the customer's browser
// stays open after paying. If the tab closes or the network drops right
// after a successful charge, verify never fires and the order would sit
// at payment_status "created" forever even though Razorpay has the money.
// This webhook is Razorpay telling us directly, so that case still gets
// reconciled.
//
// Setup (not done yet -- do this once the site is deployed somewhere
// reachable from the internet): Razorpay Dashboard > Account & Settings >
// Websites & API keys > Webhooks (or the "Webhooks" left-nav item) > Add
// New Webhook. URL: https://<your-domain>/api/webhooks/razorpay. Events:
// payment.captured and payment.failed. Razorpay gives you a webhook
// secret at that point -- put it in RAZORPAY_WEBHOOK_SECRET. This is a
// different secret from RAZORPAY_KEY_SECRET, do not reuse it.

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RazorpayWebhookPayment {
  id: string;
  order_id: string;
}

interface RazorpayWebhookEvent {
  event: string;
  payload?: {
    payment?: { entity?: RazorpayWebhookPayment };
  };
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    // Not configured yet -- accept and no-op rather than error, so this
    // doesn't get treated as a broken endpoint before it's set up.
    return NextResponse.json({ ok: true, skipped: "webhook not configured" });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (!signature || expected !== signature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment) {
    return NextResponse.json({ ok: true });
  }

  if (event.event === "payment.captured") {
    await supabaseAdmin
      .from("orders")
      .update({
        status: "paid",
        payment_status: "captured",
        razorpay_payment_id: payment.id,
      })
      .eq("razorpay_order_id", payment.order_id)
      .neq("payment_status", "captured"); // idempotent on duplicate webhook delivery
  } else if (event.event === "payment.failed") {
    await supabaseAdmin
      .from("orders")
      .update({ payment_status: "failed" })
      .eq("razorpay_order_id", payment.order_id)
      .neq("payment_status", "captured");
  }

  return NextResponse.json({ ok: true });
}
