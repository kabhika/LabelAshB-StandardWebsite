"use client";

import { useCart } from "./CartContext";

export function CartButton() {
  const { cart, openCart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="relative text-labelashb-small text-labelashb-ink-soft"
    >
      Cart
      {count > 0 && (
        <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-labelashb-accent px-1 text-labelashb-small text-labelashb-accent-foreground">
          {count}
        </span>
      )}
    </button>
  );
}
