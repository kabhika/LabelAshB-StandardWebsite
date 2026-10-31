"use client";

import { useCart } from "./CartContext";

// Oct 31 2026 redesign: a refined shopping-bag outline in the header's
// right column - warm-ivory stroke that warms to antique gold on hover,
// quantity as a small gold bead. 44x44 hit area per WCAG 2.5.5; the
// bead's dark-on-gold pair is the same contrast family the announcement
// strip uses.
export function CartButton() {
  const { cart, openCart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="relative flex h-11 w-11 items-center justify-center text-labelashb-ground/90 transition-colors hover:text-labelashb-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-gold focus-visible:ring-offset-[3px] focus-visible:ring-offset-labelashb-espresso"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5.5 8.5h13l-1.1 11.1a1.8 1.8 0 0 1-1.8 1.6H8.4a1.8 1.8 0 0 1-1.8-1.6L5.5 8.5Z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 8.5V6.8a3 3 0 0 1 6 0v1.7" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {count > 0 && (
        <span className="absolute right-0.5 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-labelashb-gold px-1 text-[11px] font-semibold leading-none text-labelashb-espresso-deep">
          {count}
        </span>
      )}
    </button>
  );
}
