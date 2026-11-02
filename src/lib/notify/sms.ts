import type { ChannelResult, OrderForNotify } from "./types";
import { smsText } from "./format";

// Twilio SMS. Needs TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and one of
// TWILIO_FROM (a Twilio number) or TWILIO_MESSAGING_SERVICE_SID.
// Note: delivery to Indian numbers can be blocked by carriers unless the
// sender is registered on India's DLT system. Failures are logged, never
// thrown, so they never block an order.
export async function sendSmsAlert(o: OrderForNotify, to: string): Promise<ChannelResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const service = process.env.TWILIO_MESSAGING_SERVICE_SID;
  if (!sid || !token || (!from && !service)) {
    return { status: "skipped", reason: "Twilio not configured" };
  }
  try {
    const body = new URLSearchParams({ To: to, Body: smsText(o) });
    if (service) body.set("MessagingServiceSid", service);
    else if (from) body.set("From", from);
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!res.ok) return { status: "failed", error: `twilio ${res.status}: ${(await res.text()).slice(0, 300)}` };
    return { status: "sent" };
  } catch (e) {
    return { status: "failed", error: String(e instanceof Error ? e.message : e).slice(0, 300) };
  }
}
