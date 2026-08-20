"use client";

import { useState } from "react";
import type { NormalizedVariant } from "@/lib/shopify/catalog";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { useCart } from "@/components/cart/CartContext";

export function SizeSelector({ variants }: { variants: NormalizedVariant[] }) {
  const firstAvailable = variants.find((v) => v.available);
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? null);
  const selected = variants.find((v) => v.id === selectedId);
  const { addToCart, isLoading, error } = useCart();

  return (
    <div>
      <p className="text-labelashb-small text-labelashb-ink mb-2">
        Size{selected ? ` — ${selected.title}` : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId;
          return (
            <button
              key={variant.id}
              type="button"
              disabled={!variant.available}
              aria-pressed={isSelected}
              onClick={() => setSelectedId(variant.id)}
              className={`min-w-12 rounded-labelashb-sm border px-3 py-2 text-labelashb-small transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1 ${
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

      <div className="mt-6">
        {selected ? (
          <AddToCartButton
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full sm:w-auto"
            onAdd={() => addToCart(selected.id, 1)}
          />
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex min-w-[10rem] items-center justify-center rounded-labelashb-sm bg-labelashb-wine px-6 py-3 text-labelashb-body font-medium text-labelashb-accent-foreground opacity-40 cursor-not-allowed w-full sm:w-auto"
          >
            Out of stock
          </button>
        )}
        {!firstAvailable && (
          <p className="mt-2 text-labelashb-small text-labelashb-error">
            All sizes are currently out of stock.
          </p>
        )}
        {error && (
          <p className="mt-2 text-labelashb-small text-labelashb-error">{error}</p>
        )}
      </div>
    </div>
  );
}
