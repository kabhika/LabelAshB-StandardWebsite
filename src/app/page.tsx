import Link from "next/link";
import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { getCatalog, type NormalizedProduct } from "@/lib/shopify/catalog";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/shared/JsonLd";
import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel";
import { SITE_URL } from "@/lib/site";
import facts from "../../_knowledge/facts.json";

// Editorial display serif, homepage headings only - loaded here (not the
// root layout) so the rest of the site keeps its single-sans identity.
// Its CSS variable is scoped by the `fraunces.variable` class on this
// page's <main>; --font-labelashb-serif (globals.css) resolves it.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

// Secondary tones named in existing brand/product copy (blush, azure,
// alabaster, celeste, coral, claret), used only as static decorative
// swatches. Written as complete literal class names (not built from the
// tone name at runtime) because Tailwind's scanner needs the exact
// string in source to generate each utility.
const SWATCH_CLASSES = [
  "bg-labelashb-blush",
  "bg-labelashb-azure",
  "bg-labelashb-alabaster",
  "bg-labelashb-celeste",
  "bg-labelashb-coral",
  "bg-labelashb-claret",
];

// Per-column vertical offsets for the featured stagger (cycles through
// the grid's 4-up column position) - a deliberate lookbook rhythm, not
// randomized, so it's identical on every render (no hydration mismatch).
const STAGGER_OFFSETS_PX = [0, 56, 24, 40];

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
    <main
      className={`${fraunces.variable} labelashb-grain flex flex-1 flex-col bg-labelashb-paper`}
    >
      <JsonLd data={websiteJsonLd} />

      {/* Asymmetric editorial split, not the even two-column default:
          image bleeds to the true viewport edge at roughly two-thirds
          width, text column holds a third. */}
      <section className="flex flex-col border-b border-labelashb-border md:min-h-[85vh] md:flex-row">
        <div className="order-2 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-16 md:order-1 md:w-[36%] md:px-14 lg:px-16">
          <Reveal>
            {/* text-labelashb-display is viewport-relative (vw), which is
                correct for a full-width context like style-tile but wrong
                here: this column is a minority share of viewport from md:
                up, so the token's natural value overshoots and wraps to 3
                lines across roughly 768-1200px (verified against live DOM
                measurements, not just arithmetic - the naive vw-vs-column
                math was off twice before this held). The md:/xl: override
                is a real container-width correction, not a duplicate of
                the token's own mobile-safety clamp. */}
            <h1 className="font-labelashb-serif text-labelashb-display text-labelashb-ink md:text-[clamp(2rem,0.5rem+4.5vw,3.5rem)] xl:text-labelashb-display">
              Linen. Silk. Cotton.
            </h1>
            <span
              aria-hidden="true"
              className="mt-5 block h-px w-14 bg-labelashb-terracotta"
            />
            <p className="mt-5 line-clamp-3 max-w-md text-labelashb-body-lg text-labelashb-ink-soft sm:line-clamp-none">
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

        <div
          className="labelashb-reveal relative order-1 aspect-[4/3] md:order-2 md:aspect-auto md:w-[64%]"
          style={{ animationDelay: "0.15s" }}
        >
          <HeroCarousel slides={heroSlides} />
        </div>
      </section>

      <section className="px-6 py-28 sm:px-10 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 flex items-baseline justify-between">
            {/* Border-bottom accent, not a separate decorative mark - reuses
                the hairline-underline language from the hero rule above
                instead of inventing a new device. Terracotta here, not the
                sitewide indigo accent - this heading exists only on this
                editorial redesign of the homepage. */}
            <h2 className="font-labelashb-serif inline-block border-b-2 border-labelashb-terracotta pb-2 text-labelashb-h2 text-labelashb-ink">
              Featured
            </h2>
            <Link
              href="/products"
              className="text-labelashb-small text-labelashb-terracotta underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
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
                className="mt-6 inline-block text-labelashb-small text-labelashb-terracotta underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
              >
                Browse the full catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product, i) => (
                <Reveal key={product.id} delay={0.3 + i * 0.07}>
                  <div
                    className="sm:translate-y-[var(--stagger)]"
                    style={{
                      ["--stagger" as string]: `${STAGGER_OFFSETS_PX[i % STAGGER_OFFSETS_PX.length]}px`,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className={`mb-3 block h-[3px] w-8 ${SWATCH_CLASSES[i % SWATCH_CLASSES.length]}`}
                    />
                    <ProductCard product={product} />
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
