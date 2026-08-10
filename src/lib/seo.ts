import { SITE_URL } from "@/lib/site";
import type { NormalizedProduct } from "@/lib/shopify/catalog";

// Meta descriptions must land in the 70-160 character range. Product
// descriptions in this catalog run long and prose-heavy (real copy, not
// bullet specs) - truncate to a clean word boundary rather than cutting
// mid-word.
export function truncateDescription(text: string, max = 157): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max)}...`;
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function productJsonLd(product: NormalizedProduct) {
  const url = `${SITE_URL}/products/${product.handle}`;
  const availability = product.inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  // sku only makes sense on a single Offer (one purchasable price point).
  // AggregateOffer spans a price range across variants that can carry
  // different SKUs, so it gets no sku field. Within a single Offer, use
  // the first variant with a real SKU - several variants in this catalog
  // have sku:null in Shopify, so omit rather than invent one.
  const firstSku = product.variants.find((v) => v.sku)?.sku;

  const offers =
    product.minPrice === product.maxPrice
      ? {
          "@type": "Offer",
          url,
          priceCurrency: product.currencyCode,
          price: product.minPrice,
          availability,
          ...(firstSku ? { sku: firstSku } : {}),
        }
      : {
          "@type": "AggregateOffer",
          url,
          priceCurrency: product.currencyCode,
          lowPrice: product.minPrice,
          highPrice: product.maxPrice,
          offerCount: product.variants.length,
          availability,
        };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((img) => img.url),
    category: product.category,
    brand: {
      "@type": "Brand",
      name: "Label AshB",
    },
    url,
    offers,
  };
}
