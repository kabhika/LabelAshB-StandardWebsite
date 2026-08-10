"use client";

import { useState } from "react";
import type { NormalizedVariant } from "@/lib/shopify/catalog";
import { Button } from "@/components/ui/Button";

export function SizeSelector({ variants }: { variants: NormalizedVariant[] }) {
  const firstAvailable = variants.find((v) => v.available);
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? null);
  const selected = variants.find((v) => v.id === selectedId);

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
              className={`min-w-12 border px-3 py-2 text-labelashb-small transition-colors ${
                !variant.available
                  ? "border-labelashb-border text-labelashb-ink-soft/50 line-through cursor-not-allowed"
                  : isSelected
                    ? "border-labelashb-ink bg-labelashb-ink text-labelashb-ground"
                    : "border-labelashb-border text-labelashb-ink hover:border-labelashb-ink"
              }`}
            >
              {variant.title}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <Button variant="primary" disabled={!selected} className="w-full sm:w-auto">
          {selected ? "Add to cart" : "Out of stock"}
        </Button>
        {!firstAvailable && (
          <p className="mt-2 text-labelashb-small text-labelashb-error">
            All sizes are currently out of stock.
          </p>
        )}
        <p className="mt-2 text-labelashb-small text-labelashb-ink-soft">
          Cart and checkout land in Phase 4 — this button is a placeholder.
        </p>
      </div>
    </div>
  );
}
