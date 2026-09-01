// Cart persistence: an httpOnly cookie holding only line references
// (variant id + quantity). No price or product data lives here -- that is
// always re-read from Supabase, both for display (src/lib/cart/cart.ts)
// and, critically, again server side at checkout
// (src/app/api/checkout/create-order/route.ts). A tampered cookie can at
// most show a wrong cart preview; it can never change what gets charged.

import { cookies } from "next/headers";

const CART_COOKIE = "labelashb_cart";

export interface CartItem {
  variantId: string;
  quantity: number;
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.variantId === "string" &&
    v.variantId.length > 0 &&
    Number.isInteger(v.quantity) &&
    (v.quantity as number) > 0
  );
}

export async function readCartItems(): Promise<CartItem[]> {
  const jar = await cookies();
  const raw = jar.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

export async function writeCartItems(items: CartItem[]): Promise<void> {
  const jar = await cookies();
  if (items.length === 0) {
    jar.delete(CART_COOKIE);
    return;
  }
  jar.set(CART_COOKIE, JSON.stringify(items), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
