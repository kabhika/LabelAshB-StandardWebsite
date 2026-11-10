import { createHmac, timingSafeEqual } from "node:crypto";

export const RECEIPT_COOKIE = "labelashb_receipt";
export const RECEIPT_MAX_AGE = 30 * 60;

function signature(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update("checkout-receipt:" + payload).digest();
}

export function createReceipt(orderNumber: string, secret: string): string {
  const expires = Date.now() + RECEIPT_MAX_AGE * 1000;
  const payload = Buffer.from(JSON.stringify({ orderNumber, expires })).toString("base64url");
  return payload + "." + signature(payload, secret).toString("hex");
}

export function readReceipt(token: string | undefined, secret: string | undefined): string | null {
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !/^[a-f0-9]{64}$/.test(parts[1])) return null;
  if (!timingSafeEqual(signature(parts[0], secret), Buffer.from(parts[1], "hex"))) return null;
  try {
    const { orderNumber, expires } = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    return typeof orderNumber === "string" && typeof expires === "number" && expires > Date.now()
      ? orderNumber
      : null;
  } catch {
    return null;
  }
}
