import nodemailer from "nodemailer";
import type { ChannelResult, OrderForNotify } from "./types";
import { emailHtml, emailSubject, emailText } from "./format";

// Sends through Resend when RESEND_API_KEY is set, otherwise through SMTP
// (for example the Hostinger mailbox) when SMTP_HOST, SMTP_USER and
// SMTP_PASS are set. If neither is configured the send is skipped and
// recorded as skipped in notification_log.
export async function sendEmailAlert(o: OrderForNotify, to: string[]): Promise<ChannelResult> {
  if (to.length === 0) return { status: "skipped", reason: "no recipients configured" };
  const from = process.env.EMAIL_FROM ?? "Label AshB Orders <orders@labelashb.in>";

  try {
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `order-${o.order_number}`,
        },
        body: JSON.stringify({
          from,
          to,
          subject: emailSubject(o),
          html: emailHtml(o),
          text: emailText(o),
        }),
      });
      if (!res.ok) return { status: "failed", error: `resend ${res.status}: ${(await res.text()).slice(0, 300)}` };
      return { status: "sent" };
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const port = Number(process.env.SMTP_PORT ?? 465);
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transport.sendMail({
        from: process.env.EMAIL_FROM ?? `Label AshB Orders <${process.env.SMTP_USER}>`,
        to,
        subject: emailSubject(o),
        text: emailText(o),
        html: emailHtml(o),
      });
      return { status: "sent" };
    }

    return { status: "skipped", reason: "no email provider configured" };
  } catch (e) {
    return { status: "failed", error: String(e instanceof Error ? e.message : e).slice(0, 300) };
  }
}
