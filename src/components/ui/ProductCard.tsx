import Image from "next/image";
import type { NormalizedProduct } from "@/lib/shopify/catalog";

function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProductCard({ product }: { product: NormalizedProduct }) {
  const image = product.images[0];
  const priceLabel =
    product.minPrice === product.maxPrice
      ? formatPrice(product.minPrice, product.currencyCode)
      : `${formatPrice(product.minPrice, product.currencyCode)}–${formatPrice(product.maxPrice, product.currencyCode)}`;

  return (
    <a
      href={`/products/${product.handle}`}
      className="group block transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
    >
      <div className="relative aspect-labelashb-product overflow-hidden bg-labelashb-ground-alt p-3">
        {image && (
          <div className="relative h-full w-full">
            <Image
              src={image.url}
              alt={image.altText || product.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain"
            />
          </div>
        )}
        {!product.inStock && (
          <span className="absolute top-3 left-3 bg-labelashb-ground px-2 py-1 text-labelashb-eyebrow uppercase text-labelashb-ink-soft">
            Sold out
          </span>
        )}
      </div>
      <div className="pt-4 text-center">
        <h3 className="text-labelashb-small text-labelashb-ink transition-colors duration-300 group-hover:text-labelashb-accent">
          {product.title}
        </h3>
        {/* Price dropped from body(16) to small(14) alongside the name -
            at the name's old body-lg(18) size, body(16) read as a quieter
            secondary line; once the name itself is small(14), a body-size
            price would outsize it and invert the hierarchy. Color
            (ink-soft vs ink) still separates them at equal size. */}
        <p className="mt-1 text-labelashb-small text-labelashb-ink-soft tabular-nums">
          {priceLabel}
        </p>
      </div>
    </a>
  );
}
