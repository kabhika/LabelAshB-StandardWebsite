import type { ChannelResult, OrderForNotify } from "./types";
import { whatsappText } from "./format";

// Wassenger group message. Off until WASSENGER_TOKEN and
// WASSENGER_GROUP_ID (looks like 1234567890@g.us) are set.
export async function sendWhatsappAlert(o: OrderForNotify, group: string | undefined): Promise<ChannelResult> {
  const token = process.env.WASSENGER_TOKEN;
  if (!token || !group) return { status: "skipped", reason: "WhatsApp group not configured" };
  try {
    const res = await fetch("https://api.wassenger.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Token: token },
      body: JSON.stringify({ group, message: whatsappText(o) }),
    });
    if (!res.ok) return { status: "failed", error: `wassenger ${res.status}: ${(await res.text()).slice(0, 300)}` };
    return { status: "sent" };
  } catch (e) {
    return { status: "failed", error: String(e instanceof Error ? e.message : e).slice(0, 300) };
  }
}
