// Server-only. RAZORPAY_KEY_SECRET must never reach the browser -- only
// NEXT_PUBLIC_RAZORPAY_KEY_ID (the key id, not the secret) is safe there,
// and that's what Checkout.js uses client side to open the payment modal.
// Import this file only from Route Handlers / server code.

import Razorpay from "razorpay";

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!KEY_ID || !KEY_SECRET) {
  throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET env vars");
}

export const razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});
