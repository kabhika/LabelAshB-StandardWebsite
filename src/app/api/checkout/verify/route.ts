// Confirms a payment the browser says succeeded. This runs right after
// Razorpay's Checkout.js modal calls its success handler client side --
// see also /api/webhooks/razorpay, which reconciles the case where the
// browser closes before this ever fires.

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { writeCartItems } from "@/lib/cart/storage";

interface VerifyBody {
  supabaseOrderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function POST(request: Request) {
  let body: VerifyBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    supabaseOrderId,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = body;

  if (!supabaseOrderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
  }

  // Razorpay's documented scheme: HMAC-SHA256 of "{order_id}|{payment_id}"
  // using the key secret. This is the authoritative proof the payment is
  // real -- the client's say-so alone is never trusted.
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expected !== razorpaySignature) {
    await supabaseAdmin
      .from("orders")
      .update({ payment_status: "failed" })
      .eq("id", supabaseOrderId)
      .eq("razorpay_order_id", razorpayOrderId);

    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .update({
      status: "paid",
      payment_status: "captured",
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    })
    .eq("id", supabaseOrderId)
    .eq("razorpay_order_id", razorpayOrderId)
    .select("order_number")
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Could not finalize order." }, { status: 500 });
  }

  await writeCartItems([]);

  return NextResponse.json({ orderNumber: order.order_number });
}
