"use server";

import { cookies } from "next/headers";
import {
  addCartLine,
  createCart,
  getCart,
  removeCartLine,
  updateCartLine,
  type ShopifyCart,
} from "@/lib/shopify/cart";

const CART_COOKIE = "labelashb_cart_id";

export interface CartActionResult {
  cart: ShopifyCart | null;
  error: string | null;
}

export async function getCartAction(): Promise<CartActionResult> {
  const jar = await cookies();
  const cartId = jar.get(CART_COOKIE)?.value;
  if (!cartId) {
    return { cart: null, error: null };
  }

  const cart = await getCart(cartId);
  // A cart older than Shopify's ~10-day expiry (or otherwise deleted)
  // comes back null — treat that the same as "no cart yet", not an error.
  if (!cart) {
    jar.delete(CART_COOKIE);
  }
  return { cart, error: null };
}

export async function addToCartAction(
  variantId: string,
  quantity = 1,
): Promise<CartActionResult> {
  const jar = await cookies();
  const cartId = jar.get(CART_COOKIE)?.value;

  if (!cartId) {
    const { cart, errors } = await createCart(variantId, quantity);
    if (cart) {
      jar.set(CART_COOKIE, cart.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return { cart, error: errors[0]?.message ?? null };
  }

  const existing = await getCart(cartId);
  if (!existing) {
    jar.delete(CART_COOKIE);
    const { cart, errors } = await createCart(variantId, quantity);
    if (cart) {
      jar.set(CART_COOKIE, cart.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return { cart, error: errors[0]?.message ?? null };
  }

  const { cart, errors } = await addCartLine(cartId, variantId, quantity);
  return { cart, error: errors[0]?.message ?? null };
}

export async function updateCartLineAction(
  lineId: string,
  quantity: number,
): Promise<CartActionResult> {
  const jar = await cookies();
  const cartId = jar.get(CART_COOKIE)?.value;
  if (!cartId) {
    return { cart: null, error: "No active cart." };
  }
  const { cart, errors } = await updateCartLine(cartId, lineId, quantity);
  return { cart, error: errors[0]?.message ?? null };
}

export async function removeCartLineAction(
  lineId: string,
): Promise<CartActionResult> {
  const jar = await cookies();
  const cartId = jar.get(CART_COOKIE)?.value;
  if (!cartId) {
    return { cart: null, error: "No active cart." };
  }
  const { cart, errors } = await removeCartLine(cartId, lineId);
  return { cart, error: errors[0]?.message ?? null };
}
