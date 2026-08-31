import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify/catalog";
import { Gallery } from "@/components/catalog/Gallery";
import { SizeSelector } from "@/components/catalog/SizeSelector";
import { PdpOffers } from "@/components/catalog/PdpOffers";
import { demoteH1 } from "@/lib/html";
import { JsonLd } from "@/components/shared/JsonLd";
import { breadcrumbJsonLd, productJsonLd, truncateDescription } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return {};

  const description = truncateDescription(product.description);

  return {
    title: product.title,
    description,
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: product.images[0]
      ? {
          // Re-shoot images are repo-local paths ("/collection/...");
          // og:image needs an absolute URL, so root those at SITE_URL.
          // Shopify CDN urls are already absolute and pass through.
          images: [
            {
              url: product.images[0].url.startsWith("/")
                ? `${SITE_URL}${product.images[0].url}`
                : product.images[0].url,
            },
          ],
        }
      : undefined,
  };
}

function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

function materialLabel(slug: string): string {
  return slug
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[handle]">) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const priceLabel =
    product.minPrice === product.maxPrice
      ? formatPrice(product.minPrice, product.currencyCode)
      : `${formatPrice(product.minPrice, product.currencyCode)}–${formatPrice(product.maxPrice, product.currencyCode)}`;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop All", path: "/products" },
          { name: product.title, path: `/products/${product.handle}` },
        ])}
      />
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <Gallery images={product.images} productTitle={product.title} />

        <div>
          <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft">
            {product.category} · Handcrafted in India
          </p>
          <h1 className="mt-2 text-labelashb-h1 text-labelashb-ink">
            {product.title}
          </h1>
          <p className="mt-3 text-labelashb-h3 text-labelashb-ink tabular-nums">{priceLabel}</p>

          {product.materials.length > 0 && (
            <p className="mt-2 text-labelashb-small text-labelashb-ink-soft">
              {product.materials.map(materialLabel).join(", ")}
            </p>
          )}

          <div className="mt-8">
            <SizeSelector variants={product.variants} />
            <PdpOffers />
          </div>

          {product.descriptionHtml && (
            <div
              className="prose prose-sm mt-10 max-w-none text-labelashb-ink-soft [&_p]:mb-4"
              dangerouslySetInnerHTML={{ __html: demoteH1(product.descriptionHtml) }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
