"use client";

import { useId, useState } from "react";
import type { NormalizedVariant } from "@/lib/shopify/catalog";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { useCart } from "@/components/cart/CartContext";

// Card gets its own component rather than embedding SizeSelector directly -
// that one is sized and labeled for a full PDP, not a grid card - but the
// selected-state treatment (border-highlight, no fill) and the
// AddToCartButton it triggers match SizeSelector.tsx exactly.
//
// Oct 31 refinement (client brief: "simplify the repeated size boxes and
// large dark buttons with a discreet 'Choose size' treatment"): collapsed
// by default into one quiet outlined button - the grid no longer shows a
// wall of size chips + dark CTAs. Expanding reveals the SAME chips and
// add-to-cart as before, so size availability, selection and cart
// behaviour are unchanged, and the action is a visible button (works on
// touch, no hover needed).
export function ProductCardSizePicker({ variants }: { variants: NormalizedVariant[] }) {
  const firstAvailable = variants.find((v) => v.available);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? null);
  const selected = variants.find((v) => v.id === selectedId);
  const { addToCart, isLoading, error } = useCart();
  const regionId = useId();

  if (!firstAvailable) {
    return (
      <p className="mt-3 text-labelashb-small text-labelashb-wine">
        All sizes are currently out of stock.
      </p>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between border border-labelashb-ink/40 px-3 py-2 text-labelashb-small font-medium text-labelashb-ink transition-colors hover:border-labelashb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
      >
        Choose size
        <span
          aria-hidden="true"
          className={`text-labelashb-ink-soft transition-transform duration-200 motion-reduce:transition-none ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>

      {open && (
        <div id={regionId} className="mt-2">
          <div className="flex flex-wrap gap-1.5">
            {variants.map((variant) => {
              const isSelected = variant.id === selectedId;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={!variant.available}
                  aria-pressed={isSelected}
                  aria-label={`Size ${variant.title}`}
                  onClick={() => setSelectedId(variant.id)}
                  className={`min-w-9 rounded-labelashb-sm border px-2.5 py-1.5 text-labelashb-small font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1 ${
                    !variant.available
                      ? "border-labelashb-border text-labelashb-ink-soft/50 line-through cursor-not-allowed"
                      : isSelected
                        ? "border-labelashb-wine text-labelashb-wine"
                        : "border-labelashb-ink/45 text-labelashb-ink hover:border-labelashb-ink"
                  }`}
                >
                  {variant.title}
                </button>
              );
            })}
          </div>

          <div className="mt-2">
            <AddToCartButton
              disabled={isLoading}
              isLoading={isLoading}
              className="w-full"
              onAdd={() => selected && addToCart(selected.id, 1)}
            />
          </div>
          {error && (
            <p className="mt-2 text-labelashb-small text-labelashb-wine">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
