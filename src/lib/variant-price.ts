import type { NormalizedVariant } from "@/lib/shopify/catalog";

export function selectedVariantPrice(
  variants: NormalizedVariant[],
  selected: NormalizedVariant | undefined,
): string | null {
  if (!selected || variants.every((variant) => variant.price === selected.price)) {
    return null;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: selected.currencyCode,
    maximumFractionDigits: 0,
  }).format(selected.price);
}
