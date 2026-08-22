import Image from "next/image";
import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import {
  DISPLAY_CATEGORIES,
  MATERIAL_GROUPS,
  getCatalog,
  type NormalizedProduct,
} from "@/lib/shopify/catalog";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/shared/JsonLd";
import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel";
import { ServiceAssuranceBand } from "@/components/home/ServiceAssuranceBand";
import { TabbedProductCarousel } from "@/components/home/TabbedProductCarousel";
import { CraftBadgesBand } from "@/components/home/CraftBadgesBand";
import { PromoTileGrid, type PromoTile } from "@/components/home/PromoTileGrid";
import {
  HorizontalImageScroller,
  type ScrollerImage,
} from "@/components/home/HorizontalImageScroller";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { WhatsAppFloat } from "@/components/home/WhatsAppFloat";
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

// Per-column vertical offsets for the featured stagger (cycles through
// the grid's column position) - a deliberate lookbook rhythm, not
// randomized, so it's identical on every render (no hydration mismatch).
// Two-tier alternation, not four distinct values: columns 1/3 must land
// on the same offset and 2/4 on the same offset, or the row reads as
// misaligned rather than a deliberate stagger.
const STAGGER_OFFSETS_PX = [0, 32];

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

// One real product image per category, for the 3-tile promo grid - never
// padded to a 4th tile, the catalog only has 3 real categories
// (PLACEHOLDER-POLICY.md).
function pickCategoryTiles(catalog: NormalizedProduct[]): PromoTile[] {
  const tiles: PromoTile[] = [];
  for (const category of DISPLAY_CATEGORIES) {
    const match = catalog.find(
      (p) => p.inStock && p.category === category && p.images.length > 0,
    );
    if (!match) continue;
    const image = match.images[0];
    tiles.push({
      image: { url: image.url, alt: image.altText || match.title },
      label: category,
      href: `/products?category=${encodeURIComponent(category)}`,
    });
  }
  return tiles;
}

// One real product image per material group, for the fabric-collection
// carousel - verified distribution in PLACEHOLDER-POLICY.md (linen
// dominant, cotton and combined-silk both present).
function pickMaterialShowcase(catalog: NormalizedProduct[]): ScrollerImage[] {
  const images: ScrollerImage[] = [];
  for (const { label, slugs } of MATERIAL_GROUPS) {
    const match = catalog.find(
      (p) =>
        p.inStock &&
        p.images.length > 0 &&
        p.materials.some((m) => slugs.includes(m)),
    );
    if (!match) continue;
    const image = match.images[0];
    images.push({ url: image.url, alt: image.altText || match.title, caption: label });
  }
  return images;
}

export default async function Home() {
  const catalog = await getCatalog();
  const inStock = catalog.filter((p) => p.inStock);
  const newIn = inStock.slice(0, 4);
  const heroSlides = pickHeroSlides(catalog);
  const categoryTiles = pickCategoryTiles(catalog);
  const materialShowcase = pickMaterialShowcase(catalog);
  const whyUsProduct = inStock.find((p) => p.category === "Co-ord Sets" && p.images.length > 1) ?? inStock[0];
  const whyUsImage = whyUsProduct?.images[1] ?? whyUsProduct?.images[0];

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
    <>
      <main
        className={`${fraunces.variable} labelashb-grain flex flex-1 flex-col bg-labelashb-ivory`}
      >
        <JsonLd data={websiteJsonLd} />

        {/* Hero - asymmetric editorial split, not the even two-column
            default: image bleeds to the true viewport edge at roughly
            two-thirds width, text column holds a third. */}
        <section className="flex flex-col border-b border-labelashb-border md:min-h-[85vh] md:flex-row">
          <div className="order-2 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-16 md:order-1 md:w-[36%] md:px-14 lg:px-16">
            <Reveal>
              {/* text-labelashb-display is viewport-relative (vw), which is
                  correct for a full-width context like style-tile but wrong
                  here: this column is a minority share of viewport from md:
                  up, so the token's natural value overshoots and wraps to 3
                  lines across roughly 768-1200px. The md:/xl: override is a
                  real container-width correction, not a duplicate of the
                  token's own mobile-safety clamp. */}
              <h1 className="font-labelashb-serif text-labelashb-display text-labelashb-ink md:text-[clamp(2rem,0.5rem+4.5vw,3.5rem)] xl:text-labelashb-display">
                Linen. Silk. Cotton.
              </h1>
              <span aria-hidden="true" className="mt-5 block h-px w-14 bg-labelashb-indigo" />
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

          {/* Plain-CSS fade+rise (globals.css .labelashb-reveal), not the
              Reveal component: Reveal's motion.div applies an inline
              transform, which becomes a containing block for this column's
              absolutely-positioned HeroCarousel and collapses its h-full
              chain to 0 height. */}
          <div
            className="labelashb-reveal relative order-1 aspect-[4/3] md:order-2 md:aspect-auto md:w-[64%]"
            style={{ animationDelay: "0.15s" }}
          >
            <HeroCarousel slides={heroSlides} />
          </div>
        </section>

        <div className="flex flex-col gap-labelashb-section-generous py-labelashb-section-generous">
          {/* New in - a short editorial tease, not a second full grid: the
              tabbed carousel right below is where a shopper actually
              browses by category. */}
          {newIn.length > 0 && (
            <section className="px-6 sm:px-10 lg:px-16" aria-labelledby="new-in-heading">
              <div className="mx-auto max-w-6xl">
                <h2
                  id="new-in-heading"
                  className="font-labelashb-serif inline-block border-b-2 border-labelashb-indigo pb-2 text-labelashb-h2 text-labelashb-ink"
                >
                  New in
                </h2>
                <div className="mt-labelashb-section-compact grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
                  {newIn.map((product, i) => (
                    <Reveal key={product.id} delay={0.1 + i * 0.06}>
                      <div
                        className="sm:translate-y-[var(--stagger)]"
                        style={{
                          ["--stagger" as string]: `${STAGGER_OFFSETS_PX[i % STAGGER_OFFSETS_PX.length]}px`,
                        }}
                      >
                        <ProductCard product={product} />
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Shop by category - tabs derived from the live catalog. */}
          <section className="px-6 sm:px-10 lg:px-16" aria-label="Shop by category">
            <div className="mx-auto max-w-6xl">
              <TabbedProductCarousel
                products={catalog}
                excludeIds={new Set(newIn.map((p) => p.id))}
              />
            </div>
          </section>

          {/* Fabric collections - Linen / Cotton / Silk, real catalog
              photography and distribution (PLACEHOLDER-POLICY.md), not a
              1:1 copy of a reference site's own fabric groupings. */}
          {materialShowcase.length > 0 && (
            <section className="px-6 sm:px-10 lg:px-16" aria-labelledby="fabric-heading">
              <div className="mx-auto max-w-6xl">
                <h2
                  id="fabric-heading"
                  className="font-labelashb-serif inline-block border-b-2 border-labelashb-emerald pb-2 text-labelashb-h2 text-labelashb-ink"
                >
                  Shop by fabric
                </h2>
                <div className="mt-labelashb-section-compact">
                  <HorizontalImageScroller images={materialShowcase} labelledBy="fabric-heading" />
                </div>
              </div>
            </section>
          )}

          {/* Category promo grid - 3 real tiles (Dresses / Tops / Co-ord
              Sets), never padded to a 4th (PLACEHOLDER-POLICY.md). */}
          {categoryTiles.length > 0 && (
            <section className="px-6 sm:px-10 lg:px-16" aria-labelledby="categories-heading">
              <div className="mx-auto max-w-6xl">
                <h2
                  id="categories-heading"
                  className="font-labelashb-serif inline-block border-b-2 border-labelashb-wine pb-2 text-labelashb-h2 text-labelashb-ink"
                >
                  Shop by category
                </h2>
                <div className="mt-labelashb-section-compact">
                  <PromoTileGrid tiles={categoryTiles} />
                </div>
              </div>
            </section>
          )}

          {/* Service assurance - solid wine band. Moved off the top-of-page
              position (originally right below the header, which duplicated
              the header's own AnnouncementBar strip too closely) to a
              middle position: past every featured/category section, right
              before the brand-story half of the page begins. */}
          <ServiceAssuranceBand />

          {/* Our Studio - atmospheric imagery, no studio photography exists
              yet. Abstract jewel-tone panels (own visual language, not
              stock photography of someone else's studio), full visual
              treatment - mood, not a specific claim (PLACEHOLDER-POLICY.md). */}
          <section
            className="bg-labelashb-ground-alt px-6 py-labelashb-section-standard sm:px-10 lg:px-16"
            aria-labelledby="studio-heading"
          >
            <div className="mx-auto max-w-6xl">
              <h2
                id="studio-heading"
                className="font-labelashb-serif inline-block border-b-2 border-labelashb-indigo pb-2 text-labelashb-h2 text-labelashb-ink"
              >
                Our studio
              </h2>
              <div className="mt-labelashb-section-compact">
                <HorizontalImageScroller
                  labelledBy="studio-heading"
                  images={[
                    { url: "/atmosphere/studio-fabric.jpg", alt: "", caption: "Fabric" },
                    { url: "/atmosphere/studio-workspace.jpg", alt: "", caption: "Workspace" },
                    { url: "/atmosphere/studio-handwork.jpg", alt: "", caption: "By hand" },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Why Label AshB - split section, real product photography and
              copy grounded in confirmed brand positioning (PRODUCT.md). */}
          <section className="px-6 sm:px-10 lg:px-16" aria-labelledby="why-heading">
            <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-center md:gap-16">
              {whyUsImage && (
                <div className="relative aspect-labelashb-card w-full overflow-hidden md:w-[42%]">
                  <Image
                    src={whyUsImage.url}
                    alt={whyUsImage.altText || whyUsProduct?.title || ""}
                    fill
                    sizes="(min-width: 768px) 42vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="md:flex-1">
                <h2
                  id="why-heading"
                  className="font-labelashb-serif text-labelashb-h2 text-labelashb-ink"
                >
                  Why Label AshB
                </h2>
                <dl className="mt-8 space-y-6">
                  <div>
                    <dt className="text-labelashb-body-lg text-labelashb-ink">Made to order</dt>
                    <dd className="mt-1 text-labelashb-body text-labelashb-ink-soft">
                      Most pieces begin only once you order them - cut and
                      finished to size over 2-3 weeks, not pulled from a
                      warehouse shelf.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-labelashb-body-lg text-labelashb-ink">
                      A small atelier, not a factory
                    </dt>
                    <dd className="mt-1 text-labelashb-body text-labelashb-ink-soft">
                      Every design starts on paper, is prototyped, and
                      refined for fit by hand - never batch-processed.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-labelashb-body-lg text-labelashb-ink">Fabric first</dt>
                    <dd className="mt-1 text-labelashb-body text-labelashb-ink-soft">
                      Handloom linen, pure silk crepe, and Indian mulberry
                      silk, chosen for feel and fall before anything else.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-labelashb-body-lg text-labelashb-ink">An Indian atelier</dt>
                    <dd className="mt-1 text-labelashb-body text-labelashb-ink-soft">
                      Designed, cut, and finished in-house - for women who
                      want clothing that feels personal and graceful.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-labelashb-body-lg text-labelashb-ink">Solar-powered workshop</dt>
                    <dd className="mt-1 text-labelashb-body text-labelashb-ink-soft">
                      The workshop runs on solar energy, generated on site
                      rather than drawn from the grid.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-labelashb-body-lg text-labelashb-ink">Fair opportunity</dt>
                    <dd className="mt-1 text-labelashb-body text-labelashb-ink-soft">
                      The people who cut, stitch, and finish each piece come
                      from underprivileged backgrounds - skilled work with
                      real opportunity behind it.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          {/* Craft badges - full-width indigo trust band, further down the
              flow next to the claims it backs up (Why Label AshB directly
              above). Three real, verified badges, not padded to a fourth. */}
          <CraftBadgesBand />

          {/* Process - fabric/craft themes, tile count independent of the
              3-category constraint above (this is process stages, not
              catalog categories). Same abstract jewel-tone treatment as
              Our Studio, no process photography exists yet either. */}
          <section
            className="bg-labelashb-ground-alt px-6 py-labelashb-section-standard sm:px-10 lg:px-16"
            aria-labelledby="process-heading"
          >
            <div className="mx-auto max-w-6xl">
              <h2
                id="process-heading"
                className="font-labelashb-serif inline-block border-b-2 border-labelashb-wine pb-2 text-labelashb-h2 text-labelashb-ink"
              >
                From paper to piece
              </h2>
              <div className="mt-labelashb-section-compact">
                <HorizontalImageScroller
                  labelledBy="process-heading"
                  images={[
                    { url: "/atmosphere/process-cutting.jpg", alt: "", caption: "Cutting" },
                    { url: "/atmosphere/process-draping.jpg", alt: "", caption: "Draping" },
                    { url: "/atmosphere/process-stitching.jpg", alt: "", caption: "Stitching" },
                    { url: "/atmosphere/process-finishing.jpg", alt: "", caption: "Finishing" },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Testimonials - no real customer quotes exist yet to put in a
              scroller; a placeholder quote would assert something specific
              and unverified, which this brand's quiet voice doesn't do
              (PLACEHOLDER-POLICY.md / PRODUCT.md). Quiet text mode instead,
              swap to the real carousel once Binita sends quotes. */}
          <section className="px-6 sm:px-10 lg:px-16" aria-label="Customer stories">
            <div className="mx-auto max-w-6xl">
              <HorizontalImageScroller
                mode="label"
                text="Customer stories are being gathered - real voices from the women wearing Label AshB, coming soon."
              />
            </div>
          </section>

          {/* Newsletter */}
          <section className="px-6 sm:px-10 lg:px-16" aria-label="Newsletter signup">
            <NewsletterSignup />
          </section>
        </div>
      </main>

      <WhatsAppFloat phone={facts.contact.whatsapp} />
    </>
  );
}
