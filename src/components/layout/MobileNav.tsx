"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

const LINK_CLASS =
  "block min-h-11 py-3 text-labelashb-body text-labelashb-ink border-b border-labelashb-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { cart, openCart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          {open ? (
            <path
              d="M4 4L18 18M18 4L4 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ) : (
            <>
              <path d="M2 6H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 11H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 16H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 bg-labelashb-ground px-6">
          <Link href="/products" className={LINK_CLASS} onClick={() => setOpen(false)}>
            Shop
          </Link>
          <Link href="/about" className={LINK_CLASS} onClick={() => setOpen(false)}>
            About
          </Link>
          <Link href="/contact" className={LINK_CLASS} onClick={() => setOpen(false)}>
            Contact
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openCart();
            }}
            className={`${LINK_CLASS} w-full text-left`}
          >
            Cart{count > 0 ? ` (${count})` : ""}
          </button>
        </div>
      )}
    </div>
  );
}
