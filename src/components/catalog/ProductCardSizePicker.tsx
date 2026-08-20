"use client";

import { useState } from "react";
import type { NormalizedVariant } from "@/lib/shopify/catalog";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { useCart } from "@/components/cart/CartContext";

// Card gets its own component rather than embedding SizeSelector directly -
// that one is sized and labeled for a full PDP, not a grid card - but the
// selected-state treatment (border-highlight, no fill) and the
// AddToCartButton it triggers match SizeSelector.tsx exactly.
export function ProductCardSizePicker({ variants }: { variants: NormalizedVariant[] }) {
  const firstAvailable = variants.find((v) => v.available);
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? null);
  const selected = variants.find((v) => v.id === selectedId);
  const { addToCart, isLoading, error } = useCart();

  if (!firstAvailable) {
    return (
      <p className="mt-3 text-labelashb-small text-labelashb-wine">
        All sizes are currently out of stock.
      </p>
    );
  }

  return (
    <div className="mt-3">
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
              className={`min-w-9 rounded-labelashb-sm border px-2.5 py-1.5 text-labelashb-small transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1 ${
                !variant.available
                  ? "border-labelashb-border text-labelashb-ink-soft/50 line-through cursor-not-allowed"
                  : isSelected
                    ? "border-labelashb-wine text-labelashb-wine"
                    : "border-labelashb-border text-labelashb-ink hover:border-labelashb-ink"
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
  );
}
