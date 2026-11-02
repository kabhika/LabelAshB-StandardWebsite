// Order alerts. Called once per order, on the first paid transition only
// (see mark_order_paid in supabase/migrations/0006). Every channel runs
// independently and every attempt is written to notification_log, so a
// failing provider never blocks an order and the admin page shows what
// happened.

import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmailAlert } from "./email";
import { sendSmsAlert } from "./sms";
import { sendWhatsappAlert } from "./whatsapp";
import type { ChannelOutcome, OrderForNotify } from "./types";

const DEFAULT_EMAILS = "sales@abenterprisesgroup.com,binita@abenterprisesgroup.com";
const DEFAULT_SMS_TO = "+919810725683";

function list(value: string | undefined, fallback: string): string[] {
  return (value ?? fallback)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function loadOrder(orderId: string): Promise<OrderForNotify | null> {
  const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", orderId).single();
  if (!order) return null;
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("product_title, variant_title, quantity, line_total")
    .eq("order_id", orderId);
  return {
    ...(order as Omit<OrderForNotify, "items">),
    total: Number(order.total),
    items: (items ?? []).map((i) => ({ ...i, line_total: Number(i.line_total) })),
  } as OrderForNotify;
}

export async function notifyOrderPaid(orderId: string): Promise<void> {
  try {
    const order = await loadOrder(orderId);
    if (!order) return;

    const emails = list(process.env.ORDER_ALERT_EMAILS, DEFAULT_EMAILS);
    const smsTo = list(process.env.ORDER_ALERT_SMS_TO, DEFAULT_SMS_TO);
    const group = process.env.WASSENGER_GROUP_ID;

    const jobs: Promise<ChannelOutcome>[] = [
      sendEmailAlert(order, emails).then((result) => ({
        channel: "email" as const,
        recipient: emails.join(", ") || "none",
        result,
      })),
      ...smsTo.map((to) =>
        sendSmsAlert(order, to).then((result) => ({ channel: "sms" as const, recipient: to, result })),
      ),
      sendWhatsappAlert(order, group).then((result) => ({
        channel: "whatsapp" as const,
        recipient: group ?? "none",
        result,
      })),
    ];
    const outcomes = await Promise.all(jobs);

    await supabaseAdmin.from("notification_log").insert(
      outcomes.map((o) => ({
        order_id: orderId,
        channel: o.channel,
        recipient: o.recipient,
        status: o.result.status,
        error:
          o.result.status === "failed"
            ? o.result.error
            : o.result.status === "skipped"
              ? o.result.reason
              : null,
      })),
    );

    if (outcomes.some((o) => o.result.status === "sent")) {
      await supabaseAdmin
        .from("orders")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", orderId);
    }
  } catch (e) {
    // Never throw out of an alert path. Record it if the database is reachable.
    console.error("notifyOrderPaid failed", e);
    await supabaseAdmin
      .from("notification_log")
      .insert({
        order_id: orderId,
        channel: "email",
        recipient: "internal",
        status: "failed",
        error: String(e instanceof Error ? e.message : e).slice(0, 300),
      })
      .then(
        () => undefined,
        () => undefined,
      );
  }
}
