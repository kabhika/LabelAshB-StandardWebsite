"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useCart } from "./CartContext";
import { Button } from "@/components/ui/Button";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function CartDrawer() {
  const { cart, isOpen, isLoading, error, closeCart, updateLine, removeLine } =
    useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  // closeCart isn't memoized in CartContext (new function identity every
  // render) - a ref keeps this effect from tearing down/re-attaching its
  // listeners and re-capturing previouslyFocused on every unrelated
  // re-render while the drawer is open, while still calling the latest
  // closeCart.
  const closeCartRef = useRef(closeCart);
  closeCartRef.current = closeCart;

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeCartRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const lines = cart?.lines.edges.map((e) => e.node) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 bg-labelashb-ink/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        tabIndex={-1}
        className="relative flex h-full w-full max-w-md flex-col bg-labelashb-ground p-6 focus:outline-none"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-labelashb-h3 text-labelashb-ink">Your Cart</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="text-labelashb-body text-labelashb-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
          >
            Close
          </button>
        </div>

        {error && (
          <p className="mt-4 text-labelashb-small text-labelashb-error">{error}</p>
        )}

        <div className="mt-6 flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <p className="text-labelashb-body text-labelashb-ink-soft">
              Your cart is empty.
            </p>
          ) : (
            <ul className="space-y-6">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4">
                  {line.merchandise.image && (
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-labelashb-ground-alt">
                      <Image
                        src={line.merchandise.image.url}
                        alt={
                          line.merchandise.image.altText ||
                          line.merchandise.product.title
                        }
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-labelashb-body text-labelashb-ink">
                      {line.merchandise.product.title}
                    </p>
                    <p className="text-labelashb-small text-labelashb-ink-soft">
                      {line.merchandise.title}
                    </p>
                    <p className="mt-1 text-labelashb-small text-labelashb-ink tabular-nums">
                      {formatPrice(
                        line.merchandise.price.amount,
                        line.merchandise.price.currencyCode,
                      )}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isLoading || line.quantity <= 1}
                        onClick={() => updateLine(line.id, line.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="flex min-h-11 min-w-11 items-center justify-center border border-labelashb-border text-labelashb-small disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
                      >
                        -
                      </button>
                      <span className="text-labelashb-small text-labelashb-ink tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={
                          isLoading ||
                          (line.merchandise.quantityAvailable !== null &&
                            line.quantity >= line.merchandise.quantityAvailable)
                        }
                        onClick={() => updateLine(line.id, line.quantity + 1)}
                        aria-label="Increase quantity"
                        className="flex min-h-11 min-w-11 items-center justify-center border border-labelashb-border text-labelashb-small disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => removeLine(line.id)}
                        className="ml-2 text-labelashb-small text-labelashb-ink-soft underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && cart && (
          <div className="border-t border-labelashb-border pt-4">
            <div className="flex items-center justify-between text-labelashb-body-lg text-labelashb-ink">
              <span>Subtotal</span>
              <span className="tabular-nums">
                {formatPrice(
                  cart.cost.subtotalAmount.amount,
                  cart.cost.subtotalAmount.currencyCode,
                )}
              </span>
            </div>
            <Button href="/checkout" variant="primary" className="mt-4 block w-full">
              Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
