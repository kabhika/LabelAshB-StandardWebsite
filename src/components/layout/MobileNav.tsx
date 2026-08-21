"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import type { NavLink } from "@/components/layout/SiteNav";

const LINK_CLASS =
  "block min-h-11 py-3 text-labelashb-body text-labelashb-ink border-b border-labelashb-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1";

const SUBLINK_CLASS =
  "block min-h-11 py-3 pl-4 text-labelashb-body text-labelashb-ink-soft border-b border-labelashb-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1";

// <details>/<summary> for the two catalog-derived groups, not another
// useState toggle - native progressive disclosure, no extra open/close
// state to wire up for what's a strict subset of the mobile menu's own
// open/close lifecycle already managed below.
function NavGroup({
  label,
  links,
  onNavigate,
}: {
  label: string;
  links: NavLink[];
  onNavigate: () => void;
}) {
  if (links.length === 0) return null;
  return (
    <details className="border-b border-labelashb-border">
      <summary className="flex min-h-11 cursor-pointer items-center py-3 text-labelashb-body text-labelashb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1">
        {label}
      </summary>
      {links.map(({ href, label: linkLabel }) => (
        <Link key={href} href={href} className={SUBLINK_CLASS} onClick={onNavigate}>
          {linkLabel}
        </Link>
      ))}
    </details>
  );
}

export function MobileNav({
  categories,
  collections,
}: {
  categories: NavLink[];
  collections: NavLink[];
}) {
  const [open, setOpen] = useState(false);
  const { cart, openCart } = useCart();
  const count = cart?.totalQuantity ?? 0;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center text-labelashb-ground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-ground focus-visible:ring-offset-1"
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
          <NavGroup
            label="Categories"
            links={categories}
            onNavigate={() => setOpen(false)}
          />
          <NavGroup
            label="Collections"
            links={collections}
            onNavigate={() => setOpen(false)}
          />
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
