"use client";

import { useState } from "react";
import type { NormalizedVariant } from "@/lib/shopify/catalog";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { NotifyMePanel } from "@/components/catalog/NotifyMePanel";
import { useCart } from "@/components/cart/CartContext";

// Sold-out sizes stay selectable (Phase 3, Oct 2026): picking one swaps
// the dead grey button for NotifyMePanel instead of a line-through dead
// chip, per the client's "sold-out sizes become Notify-me buttons" ask.
// When EVERY size is sold out the first sold-out chip starts selected so
// the panel is visible immediately - no dead button anywhere.
export function SizeSelector({
  variants,
  productTitle,
  productHandle,
  whatsapp,
}: {
  variants: NormalizedVariant[];
  productTitle: string;
  productHandle: string;
  whatsapp: string;
}) {
  const firstAvailable = variants.find((v) => v.available);
  const [selectedId, setSelectedId] = useState(
    firstAvailable?.id ?? variants[0]?.id ?? null,
  );
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
          const soldOut = !variant.available;
          return (
            <button
              key={variant.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedId(variant.id)}
              title={soldOut ? "Sold out - get notified" : undefined}
              className={`min-w-12 rounded-labelashb-sm border px-3 py-2 text-labelashb-small transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1 ${
                soldOut
                  ? isSelected
                    ? "border-labelashb-ink text-labelashb-ink-soft line-through"
                    : "border-labelashb-border text-labelashb-ink-soft/60 line-through hover:border-labelashb-ink-soft/60"
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
        {selected?.available ? (
          <AddToCartButton
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full sm:w-auto"
            onAdd={() => addToCart(selected.id, 1)}
          />
        ) : selected ? (
          <NotifyMePanel
            whatsapp={whatsapp}
            productTitle={productTitle}
            productHandle={productHandle}
            variantTitle={selected.title}
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
        {error && (
          <p className="mt-2 text-labelashb-small text-labelashb-error">{error}</p>
        )}
      </div>
    </div>
  );
}
