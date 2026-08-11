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
    <a href={`/products/${product.handle}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-labelashb-ground-alt">
        {image && (
          <Image
            src={image.url}
            alt={image.altText || product.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
        {!product.inStock && (
          <span className="absolute top-3 left-3 bg-labelashb-ground px-2 py-1 text-labelashb-eyebrow uppercase text-labelashb-ink-soft">
            Sold out
          </span>
        )}
      </div>
      <div className="pt-4">
        <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft">
          {product.category} · Handcrafted in India
        </p>
        <h3 className="mt-1 text-labelashb-body-lg text-labelashb-ink">
          {product.title}
        </h3>
        <p className="mt-1 text-labelashb-body text-labelashb-ink-soft tabular-nums">
          {priceLabel}
        </p>
      </div>
    </a>
  );
}
