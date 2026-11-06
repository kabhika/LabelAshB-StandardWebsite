import { createHmac, timingSafeEqual } from "node:crypto";

export const ORDER_HISTORY_COOKIE = "labelashb_orders";
export const ORDER_HISTORY_MAX_AGE = 90 * 24 * 60 * 60;
const MAX_ORDERS = 10;
const ORDER_ID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

function sign(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update("labelashb-order-history:" + payload).digest();
}

export function readOrderHistory(cookie: string | undefined, secret: string | undefined): string[] {
  if (!cookie || cookie.length > 1024 || !secret) return [];
  const [payload, signature, extra] = cookie.split(".");
  if (extra !== undefined || !signature || !/^[0-9a-f]{64}$/.test(signature)) return [];
  if (!timingSafeEqual(sign(payload, secret), Buffer.from(signature, "hex"))) return [];
  const [expiry, ...ids] = payload.split(":");
  if (!(Number(expiry) > Date.now()) || ids.length > MAX_ORDERS || !ids.every((id) => ORDER_ID.test(id))) {
    return [];
  }
  return ids;
}

export function rememberOrder(cookie: string | undefined, orderId: string, secret: string): string {
  const ids = [orderId, ...readOrderHistory(cookie, secret).filter((id) => id !== orderId)].slice(0, MAX_ORDERS);
  const expiry = Date.now() + ORDER_HISTORY_MAX_AGE * 1000;
  const payload = [expiry, ...ids].join(":");
  return payload + "." + sign(payload, secret).toString("hex");
}
