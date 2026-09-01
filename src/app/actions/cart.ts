"use server";

import { readCartItems, writeCartItems, type CartItem } from "@/lib/cart/storage";
import { buildCart, type LocalCart } from "@/lib/cart/cart";

export interface CartActionResult {
  cart: LocalCart | null;
  error: string | null;
}

async function loadAndReconcile(): Promise<LocalCart> {
  const items = await readCartItems();
  const { cart, validItems } = await buildCart(items);
  if (validItems.length !== items.length) {
    // A line pointed at a variant that's gone, archived, or drafted --
    // drop it from the stored cart so it doesn't keep surfacing on every
    // render.
    await writeCartItems(validItems);
  }
  return cart;
}

export async function getCartAction(): Promise<CartActionResult> {
  return { cart: await loadAndReconcile(), error: null };
}

export async function addToCartAction(
  variantId: string,
  quantity = 1,
): Promise<CartActionResult> {
  const items = await readCartItems();
  const existing = items.find((i) => i.variantId === variantId);
  const nextItems: CartItem[] = existing
    ? items.map((i) =>
        i.variantId === variantId ? { ...i, quantity: i.quantity + quantity } : i,
      )
    : [...items, { variantId, quantity }];

  const { cart, validItems } = await buildCart(nextItems);
  if (validItems.length < nextItems.length && !existing) {
    // The variant just added didn't resolve -- surface that, rather than
    // silently doing nothing.
    return { cart, error: "That item is no longer available." };
  }
  await writeCartItems(validItems);
  return { cart, error: null };
}

export async function updateCartLineAction(
  lineId: string,
  quantity: number,
): Promise<CartActionResult> {
  const items = await readCartItems();
  const nextItems =
    quantity <= 0
      ? items.filter((i) => i.variantId !== lineId)
      : items.map((i) => (i.variantId === lineId ? { ...i, quantity } : i));

  const { cart, validItems } = await buildCart(nextItems);
  await writeCartItems(validItems);
  return { cart, error: null };
}

export async function removeCartLineAction(
  lineId: string,
): Promise<CartActionResult> {
  const items = await readCartItems();
  const nextItems = items.filter((i) => i.variantId !== lineId);
  const { cart, validItems } = await buildCart(nextItems);
  await writeCartItems(validItems);
  return { cart, error: null };
}
