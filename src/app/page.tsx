import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/shopify/catalog";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/shared/JsonLd";
import { SITE_URL } from "@/lib/site";
import facts from "../../_knowledge/facts.json";

// No "title" key here - inherits root layout's bare "default" title
// ("Label AshB") instead of running through the "%s | Label AshB"
// template, which would otherwise double the brand name.
export const metadata: Metadata = {
  description:
    "Label AshB: handcrafted linen, silk and cotton dresses, tops and co-ord sets from an independent Indian atelier, ready-to-ship or made to order.",
  alternates: { canonical: "/" },
};

// Handle of the hero image source - a real catalog product, not a
// hardcoded CDN URL. If this product's photos ever change in Shopify, the
// hero updates with them instead of going stale.
const HERO_PRODUCT_HANDLE = "the-indigo-swallow";

export default async function Home() {
  const catalog = await getCatalog();
  const featured = catalog.filter((p) => p.inStock).slice(0, 6);
  const heroProduct = catalog.find((p) => p.handle === HERO_PRODUCT_HANDLE);
  const heroImage = heroProduct?.images[1] ?? heroProduct?.images[0];

  // No SearchAction - there's no free-text search on this site, only
  // category/material filters, and claiming one in schema would be
  // inaccurate.
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: facts.brand.name,
    url: SITE_URL,
    description: facts.brand.shortDescription,
  };

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={websiteJsonLd} />

      <section className="flex flex-col border-b border-labelashb-border md:min-h-[85vh] md:flex-row">
        <div className="order-2 flex flex-col justify-center px-6 py-16 sm:px-10 md:order-1 md:w-[42%] md:px-14 lg:px-20">
          <Reveal>
            <p className="mb-5 text-labelashb-eyebrow uppercase text-labelashb-ink-soft">
              Handcrafted in India
            </p>
            <h1 className="text-labelashb-display text-labelashb-ink">
              Made with time, care, and a clear eye for detail.
            </h1>
            <p className="mt-6 max-w-md text-labelashb-body-lg text-labelashb-ink-soft">
              {facts.brand.shortDescription}
            </p>
            <div className="mt-8">
              <Link href="/products">
                <Button variant="primary">Shop the collection</Button>
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="relative order-1 aspect-[4/5] md:order-2 md:aspect-auto md:w-[58%]">
          {heroImage && (
            <Image
              src={heroImage.url}
              alt={heroImage.altText || heroProduct?.title || facts.brand.name}
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              priority
              className="object-cover"
            />
          )}
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-baseline justify-between">
            <h2 className="text-labelashb-h2 text-labelashb-ink">Featured</h2>
            <Link
              href="/products"
              className="text-labelashb-small text-labelashb-accent underline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
