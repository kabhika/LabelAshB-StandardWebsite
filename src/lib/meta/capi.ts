// Meta Conversions API — server-side Purchase events.
//
// Why server-side for Purchase: the full order (value, items, hashed
// customer email/phone) lives server-side, and the event still fires when
// the buyer's browser closes before /checkout/success loads. Both the
// /api/checkout/verify path and the Razorpay webhook path call this on the
// first paid transition; Meta de-duplicates them via the shared event_id.
//
// Inert until NEXT_PUBLIC_META_PIXEL_ID + META_CAPI_ACCESS_TOKEN are set.
// NEVER throws: tracking must not be able to break the payment flow.

import crypto from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

const GRAPH_API_VERSION = "v21.0";

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Normalize an Indian phone number to E.164-ish digits (91 + 10 digits). */
function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export interface CapiClientHints {
  ip?: string | null;
  userAgent?: string | null;
}

export async function trackPurchaseConversionApi(
  orderId: string,
  hints: CapiClientHints = {},
): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  try {
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("order_number,total,currency,customer_email,customer_phone")
      .eq("id", orderId)
      .maybeSingle();
    if (orderError || !order) {
      console.error("[meta-capi] order not found:", orderId, orderError?.message ?? "");
      return;
    }

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("sku,product_id,product_title,quantity,unit_price")
      .eq("order_id", orderId);

    const userData: Record<string, string> = {};
    if (order.customer_email) {
      userData.em = sha256Hex(order.customer_email.trim().toLowerCase());
    }
    const phone = normalizePhone(order.customer_phone);
    if (phone) userData.ph = sha256Hex(phone);
    if (hints.ip) userData.client_ip_address = hints.ip;
    if (hints.userAgent) userData.client_user_agent = hints.userAgent;

    const payload: Record<string, unknown> = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          // Stable per order across verify + webhook → Meta dedups repeats.
          event_id: `purchase-${order.order_number}`,
          action_source: "website",
          user_data: userData,
          custom_data: {
            currency: order.currency || "INR",
            value: Number(order.total),
            order_id: order.order_number,
            content_type: "product",
            contents: (items ?? []).map((item) => ({
              id: item.sku || item.product_id || item.product_title || "item",
              quantity: item.quantity,
              item_price: Number(item.unit_price),
            })),
          },
        },
      ],
    };
    const testCode = process.env.META_TEST_EVENT_CODE;
    if (testCode) payload.test_event_code = testCode;

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      console.error("[meta-capi] Meta rejected the event:", res.status, JSON.stringify(json));
    } else {
      console.log(`[meta-capi] Purchase sent for ${order.order_number}`);
    }
  } catch (error) {
    console.error("[meta-capi] non-fatal failure:", error);
  }
}
