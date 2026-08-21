import Link from "next/link";
import type { NormalizedProduct } from "@/lib/shopify/catalog";
import { ProductCardGallery } from "@/components/catalog/ProductCardGallery";
import { ProductCardSizePicker } from "@/components/catalog/ProductCardSizePicker";

function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Server component: only the image cycling (ProductCardGallery) and the
// size pills + add-to-cart (ProductCardSizePicker) need the client, so
// those are the only two "use client" pieces. Everything else - image
// frame, sold-out badge, name, price - renders server-side.
export function ProductCardExpanded({ product }: { product: NormalizedProduct }) {
  const priceLabel =
    product.minPrice === product.maxPrice
      ? formatPrice(product.minPrice, product.currencyCode)
      : `${formatPrice(product.minPrice, product.currencyCode)}–${formatPrice(product.maxPrice, product.currencyCode)}`;

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/products/${product.handle}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-indigo focus-visible:ring-offset-1"
      >
        <div className="relative aspect-labelashb-card overflow-hidden bg-labelashb-ivory">
          <ProductCardGallery images={product.images} alt={product.title} />
          {!product.inStock && (
            <span className="absolute top-3 left-3 bg-labelashb-wine px-2 py-1 text-labelashb-eyebrow uppercase text-labelashb-ivory">
              Sold out
            </span>
          )}
        </div>
        <div className="mt-labelashb-card-caption text-center">
          <h3 className="text-labelashb-small text-labelashb-ink transition-colors duration-300 group-hover:text-labelashb-indigo">
            {product.title}
          </h3>
          <p className="mt-1 text-labelashb-body text-labelashb-ink-soft tabular-nums">
            {priceLabel}
          </p>
        </div>
      </Link>

      {/* mt-auto pins size picker + Add to Cart to card bottom regardless of
          how many lines the title above wraps to - flex row of cards
          stretches to tallest card's height (default align-items: stretch),
          this fills the slack instead of letting button float mid-card. */}
      <div className="mt-auto">
        <ProductCardSizePicker variants={product.variants} />
      </div>
    </article>
  );
}
