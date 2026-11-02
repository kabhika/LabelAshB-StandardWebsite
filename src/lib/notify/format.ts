import type { OrderForNotify } from "./types";

function rupees(n: number): string {
  return `Rs ${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function addressLine(o: OrderForNotify): string {
  const a = o.shipping_address ?? {};
  return [a.line1, a.line2, a.city, a.state, a.pincode, a.country]
    .filter(Boolean)
    .join(", ");
}

export function smsText(o: OrderForNotify): string {
  const first = o.items[0];
  const more = o.items.length > 1 ? ` +${o.items.length - 1} more` : "";
  const item = first ? `${first.product_title} (${first.variant_title})${more}` : "items";
  return `Label AshB new order ${o.order_number}: ${rupees(o.total)} paid. ${o.customer_name}, ${o.customer_phone}. ${item}.`.slice(
    0,
    300,
  );
}

export function whatsappText(o: OrderForNotify): string {
  const lines = o.items.map(
    (i) => `- ${i.product_title} (${i.variant_title}) x ${i.quantity}: ${rupees(i.line_total)}`,
  );
  return [
    `New paid order ${o.order_number}`,
    `Total: ${rupees(o.total)}`,
    `Customer: ${o.customer_name}, ${o.customer_phone}`,
    `Ship to: ${addressLine(o)}`,
    ...lines,
  ].join("\n");
}

export function emailSubject(o: OrderForNotify): string {
  return `New paid order ${o.order_number} (${rupees(o.total)})`;
}

export function emailText(o: OrderForNotify): string {
  return whatsappText(o) + `\nPayment id: ${o.razorpay_payment_id ?? "n/a"}\nPlaced: ${o.created_at}\n`;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

export function emailHtml(o: OrderForNotify): string {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 8px">${esc(i.product_title)} (${esc(i.variant_title)})</td><td style="padding:4px 8px">${i.quantity}</td><td style="padding:4px 8px">${esc(rupees(i.line_total))}</td></tr>`,
    )
    .join("");
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
<h2 style="margin:0 0 8px">New paid order ${esc(o.order_number)}</h2>
<p style="margin:0 0 12px">Total <strong>${esc(rupees(o.total))}</strong></p>
<table style="border-collapse:collapse;margin-bottom:12px"><tr><th align="left" style="padding:4px 8px">Item</th><th align="left" style="padding:4px 8px">Qty</th><th align="left" style="padding:4px 8px">Amount</th></tr>${rows}</table>
<p style="margin:0 0 4px"><strong>Customer</strong> ${esc(o.customer_name)}, ${esc(o.customer_phone)}${o.customer_email ? ", " + esc(o.customer_email) : ""}</p>
<p style="margin:0 0 4px"><strong>Ship to</strong> ${esc(addressLine(o))}</p>
<p style="margin:0;color:#666">Payment id ${esc(o.razorpay_payment_id ?? "n/a")}</p>
</div>`;
}
