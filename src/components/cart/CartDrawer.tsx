"use client";

import Image from "next/image";
import { useCart } from "./CartContext";
import { Button } from "@/components/ui/Button";

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
      <div className="relative flex h-full w-full max-w-md flex-col bg-labelashb-ground p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-labelashb-h3 text-labelashb-ink">Your Cart</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="text-labelashb-body text-labelashb-ink-soft"
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
                        className="border border-labelashb-border px-2 text-labelashb-small disabled:opacity-40"
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
                        className="border border-labelashb-border px-2 text-labelashb-small disabled:opacity-40"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => removeLine(line.id)}
                        className="ml-2 text-labelashb-small text-labelashb-ink-soft underline"
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
            <Button href={cart.checkoutUrl} variant="primary" className="mt-4 block w-full">
              Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
