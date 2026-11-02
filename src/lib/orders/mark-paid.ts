import { supabaseAdmin } from "@/lib/supabase/admin";

export interface MarkPaidResult {
  orderId: string;
  orderNumber: string;
  transitioned: boolean;
}

// Marks an order paid exactly once and reduces stock, via the database
// function mark_order_paid (migration 0006). If that function does not
// exist yet on the connected project, falls back to a plain update so a
// payment is never lost; in that case stock is not reduced.
export async function markOrderPaid(
  razorpayOrderId: string,
  paymentId: string,
  signature?: string,
): Promise<MarkPaidResult | null> {
  const { data, error } = await supabaseAdmin.rpc("mark_order_paid", {
    p_razorpay_order_id: razorpayOrderId,
    p_payment_id: paymentId,
    p_signature: signature ?? null,
  });

  if (!error) {
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return {
      orderId: row.r_order_id,
      orderNumber: row.r_order_number,
      transitioned: row.r_transitioned,
    };
  }

  const missing = error.code === "PGRST202" || /could not find the function/i.test(error.message);
  if (!missing) throw error;

  const { data: existing } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, payment_status")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();
  if (!existing) return null;
  if (existing.payment_status === "captured") {
    return { orderId: existing.id, orderNumber: existing.order_number, transitioned: false };
  }
  await supabaseAdmin
    .from("orders")
    .update({
      status: "paid",
      payment_status: "captured",
      razorpay_payment_id: paymentId,
      ...(signature ? { razorpay_signature: signature } : {}),
    })
    .eq("id", existing.id);
  return { orderId: existing.id, orderNumber: existing.order_number, transitioned: true };
}
