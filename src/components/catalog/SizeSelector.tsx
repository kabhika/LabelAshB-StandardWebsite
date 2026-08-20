"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { NormalizedVariant } from "@/lib/shopify/catalog";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { useCart } from "@/components/cart/CartContext";

// damping 1.0 (critically damped) / response 0.3s -> bounce 0 / duration 0.3
const PILL_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

export function SizeSelector({ variants }: { variants: NormalizedVariant[] }) {
  const firstAvailable = variants.find((v) => v.available);
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? null);
  const selected = variants.find((v) => v.id === selectedId);
  const { addToCart, isLoading, error } = useCart();
  const reduceMotion = useReducedMotion();

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
              className={`relative min-w-12 overflow-hidden border px-3 py-2 text-labelashb-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1 ${
                !variant.available
                  ? "border-labelashb-border text-labelashb-ink-soft/50 line-through cursor-not-allowed"
                  : isSelected
                    ? "border-labelashb-ink text-labelashb-ground"
                    : "border-labelashb-border text-labelashb-ink transition-colors hover:border-labelashb-ink"
              }`}
            >
              {variant.available && isSelected && (
                <motion.span
                  layoutId="size-pill-fill"
                  className="absolute inset-0 bg-labelashb-ink"
                  transition={reduceMotion ? { duration: 0 } : PILL_SPRING}
                />
              )}
              <span className="relative">{variant.title}</span>
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
            className="inline-flex min-w-[10rem] items-center justify-center rounded-labelashb-sm bg-labelashb-accent px-6 py-3 text-labelashb-body font-medium text-labelashb-accent-foreground opacity-40 cursor-not-allowed w-full sm:w-auto"
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
