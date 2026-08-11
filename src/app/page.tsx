import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog, type NormalizedProduct } from "@/lib/shopify/catalog";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/shared/JsonLd";
import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel";
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

// Curates hero slides from the live catalog instead of a hardcoded product
// handle, so a sold-through hero product doesn't leave a stale image. One
// product per category first (spreads the carousel across the range), then
// backfills from remaining in-stock products if fewer than 3 categories
// exist, so the carousel never drops below a 3-slide floor.
function pickHeroSlides(products: NormalizedProduct[]): HeroSlide[] {
  const inStock = products.filter((p) => p.inStock && p.images.length > 0);
  const seenCategories = new Set<string>();
  const curated: NormalizedProduct[] = [];

  for (const product of inStock) {
    if (curated.length >= 5) break;
    if (seenCategories.has(product.category)) continue;
    seenCategories.add(product.category);
    curated.push(product);
  }

  if (curated.length < 3) {
    for (const product of inStock) {
      if (curated.length >= 3) break;
      if (curated.includes(product)) continue;
      curated.push(product);
    }
  }

  return curated.map((product) => {
    const image = product.images[1] ?? product.images[0];
    return { url: image.url, alt: image.altText || product.title };
  });
}

export default async function Home() {
  const catalog = await getCatalog();
  const featured = catalog.filter((p) => p.inStock).slice(0, 8);
  const heroSlides = pickHeroSlides(catalog);

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
        <div className="order-2 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-16 md:order-1 md:w-[42%] md:px-14 lg:px-20">
          <Reveal>
            {/* text-labelashb-display is viewport-relative (vw), which is
                correct for a full-width context like style-tile but wrong
                here: this column is 42% of viewport from md: up, so the
                token's natural value overshoots and wraps to 3 lines
                across roughly 768-1200px (verified against live DOM
                measurements, not just arithmetic - the naive vw-vs-column
                math was off twice before this held). The md:/xl: override
                is a real container-width correction, not a duplicate of
                the token's own mobile-safety clamp. */}
            <h1 className="text-labelashb-display text-labelashb-ink md:text-[clamp(2rem,0.5rem+4.5vw,3.5rem)] xl:text-labelashb-display">
              Linen. Silk. Cotton.
            </h1>
            <p className="mt-6 line-clamp-4 max-w-md text-labelashb-body-lg text-labelashb-ink-soft sm:line-clamp-none">
              Made with time, care, and a clear eye for detail.{" "}
              {facts.brand.shortDescription}
            </p>
            <div className="mt-8">
              <Button href="/products" variant="primary">
                Shop the collection
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="relative order-1 aspect-[4/3] md:order-2 md:aspect-auto md:w-[58%]">
          <HeroCarousel slides={heroSlides} />
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
          {featured.length === 0 ? (
            <div className="max-w-md py-8">
              <p className="text-labelashb-body-lg text-labelashb-ink">
                Nothing in stock right now - new pieces are on the way.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-block text-labelashb-small text-labelashb-accent underline"
              >
                Browse the full catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
