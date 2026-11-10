import Image from "next/image";
import type { Metadata } from "next";
import {
  DISPLAY_CATEGORIES,
  MATERIAL_GROUPS,
  getCatalog,
  type NormalizedProduct,
} from "@/lib/shopify/catalog";
import {
  collectionHeroSlides,
  collectionHeroFullSlides,
} from "@/data/new-collection";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/shared/JsonLd";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { NewInLane } from "@/components/home/NewInLane";
import { ServiceAssuranceBand } from "@/components/home/ServiceAssuranceBand";
import { TabbedProductCarousel } from "@/components/home/TabbedProductCarousel";
import type { ExpandedCardProduct } from "@/components/catalog/ProductCardExpanded";
import { CraftBadgesBand } from "@/components/home/CraftBadgesBand";
import { PromoTileGrid, type PromoTile } from "@/components/home/PromoTileGrid";
import {
  HorizontalImageScroller,
  type ScrollerImage,
} from "@/components/home/HorizontalImageScroller";
import { ProcessCarousel, type ProcessStage } from "@/components/home/ProcessCarousel";
import { StudioPanels } from "@/components/home/StudioPanels";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { WhatsAppFloat } from "@/components/home/WhatsAppFloat";
import { SITE_URL } from "@/lib/site";
import facts from "../../_knowledge/facts.json";

// No "title" key here - inherits root layout's bare "default" title
// ("Label AshB") instead of running through the "%s | Label AshB"
// template, which would otherwise double the brand name.
export const revalidate = 300;

export const metadata: Metadata = {
  description:
    "Label AshB: handcrafted linen, silk and cotton dresses, tops and co-ord sets from an independent Indian atelier, ready-to-ship or made to order.",
  alternates: { canonical: "/" },
};

// Hero slides come from the New Collection (src/data/new-collection.ts):
// consistent 2:3 studio photography of one model, so the carousel reads as
// one editorial story instead of mismatched catalog shots. Curated there
// (collectionHeroSlides), not picked from the live catalog here - the old
// picker used images[1] of arbitrary in-stock products, which both cropped
// badly in a wide object-cover frame and broke whenever a product's second
// image was an oversized CDN upload that the optimizer timed out on.
const heroSlides = collectionHeroSlides();
const heroFullSlides = collectionHeroFullSlides();

// Home merchandising imagery is curated per shoot family so no single
// section mixes photo backdrops (client note, Oct 29 2026: "white hero,
// grey card, orange, peach, beige - looks like many shoots mixed").
// Classification of every folder's 01 image is in
// .match/contact-sheet-{a,b}.jpg. All tiles and the fabric row draw from
// the light-grey studio family; the New-in lane above them is the warm
// atelier set by construction (newest products); the hero is its own
// white-studio set. Until Binita reshoots the top pieces on one
// backdrop, family-per-section is the grouping rule.
const categoryTileImages: Record<string, { url: string; alt: string }> = {
  Dresses: {
    url: "/collection/27-meadow-whisper-hand-embroidered-linen-dress/01.jpg",
    alt: "Front view of the Meadow Whisper hand-embroidered linen dress",
  },
  Tops: {
    url: "/collection/23-celeste-line-linen-top/01.jpg",
    alt: "Front view of the Celeste Line linen top",
  },
  "Co-ord Sets": {
    url: "/collection/25-ivory-bloom-hand-embroidered-linen-co-ord-set/01.jpg",
    alt: "Front view of the Ivory Bloom hand-embroidered linen co-ord set",
  },
};

const fabricShowcaseImages: Record<string, { url: string; alt: string }> = {
  Linen: {
    url: "/collection/20-flutter-flow-linen-dress/01.jpg",
    alt: "Front view of the Flutter Flow linen dress",
  },
  Cotton: {
    url: "/collection/45-crimson-tiles-hand-block-cotton-dress/01.jpg",
    alt: "Front view of the Crimson Tiles hand-block cotton dress",
  },
  Silk: {
    url: "/collection/36-gilded-garden-chanderi-coord-set/01.jpg",
    alt: "Front view of the Gilded Garden chanderi co-ord set",
  },
};

const processStages: ProcessStage[] = [
  {
    title: "Cutting",
    images: [
      { src: "/atmosphere/process/cutting-restored-01.png", alt: "Dusty-rose linen garment pieces in the Label AshB workshop" },
      { src: "/atmosphere/process/cutting-restored-02.png", alt: "Close view of a dusty-rose linen seam under construction" },
      { src: "/atmosphere/process/cutting-restored-03.png", alt: "Gathered dusty-rose linen detail during garment construction" },
    ],
  },
  {
    title: "Draping",
    images: [
      { src: "/atmosphere/process/draping-restored-01.png", alt: "Makers assessing a black embroidered garment on a dress form" },
      { src: "/atmosphere/process/draping-restored-02.png", alt: "White embroidered linen outfit displayed on a dress form" },
      { src: "/atmosphere/process/draping-restored-03.png", alt: "Maker refining the drape of a red dress on a dress form" },
    ],
  },
  {
    title: "Stitching",
    images: [
      { src: "/atmosphere/process/stitching-restored-01.png", alt: "Two makers reviewing chalk-marked black garment pieces" },
      { src: "/atmosphere/process/stitching-restored-02.png", alt: "Makers reviewing the lace edge of a printed garment" },
      { src: "/atmosphere/process/stitching-restored-03.png", alt: "Close workshop view of chalk-marked garment pieces before stitching" },
    ],
  },
];

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
    const curatedImage = categoryTileImages[category];
    tiles.push({
      image: curatedImage ?? { url: match.images[0].url, alt: match.images[0].altText || match.title },
      label: category,
      href: `/products?category=${encodeURIComponent(category)}`,
    });
  }
  return tiles;
}

// One real product image per material group, for the fabric-collection
// carousel - verified distribution in PLACEHOLDER-POLICY.md (linen
// dominant, cotton and combined-silk both present). The note lines list
// the actual weaves/kinds the atelier works in, confirmed by the client
// (brand questions, Oct 19 2026) - the old captions named only
// "handloom linen / mulberry silk".
const fabricNotes: Record<string, string> = {
  Linen: "Breathable damask, jacquard, cambric, twill, and herringbone for Indian summers.",
  Cotton: "Pure cotton, softer with every wash.",
  Silk: "Mulberry, crepe, and tussar silks, each with a distinct drape.",
};

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
    const curatedImage = fabricShowcaseImages[label];
    images.push({
      url: curatedImage?.url ?? match.images[0].url,
      alt: curatedImage?.alt ?? (match.images[0].altText || match.title),
      caption: label,
      note: fabricNotes[label],
      frame: "product",
    });
  }
  return images;
}

const SHOW_CUSTOMER_STORIES = false;

function toExpandedCard(product: NormalizedProduct): ExpandedCardProduct {
  const { id, handle, title, category, minPrice, maxPrice, currencyCode, inStock, images, variants } = product;
  return { id, handle, title, category, minPrice, maxPrice, currencyCode, inStock, images: images.slice(0, 2), variants };
}

export default async function Home() {
  const catalog = await getCatalog();
  const inStock = catalog.filter((p) => p.inStock);
  const categoryTiles = pickCategoryTiles(catalog);
  const materialShowcase = pickMaterialShowcase(catalog);

  // "New in the atelier" lane (Phase 3, Oct 2026): the eight most
  // recently created in-stock products (widened from 4 on Nov 6 2026
  // when the client uploaded eight new garments in one drop and only
  // four surfaced). created_at comes from Supabase - the Shopify-era
  // rows all share the migration timestamp, so the tie-break (title)
  // keeps the order stable there. The lane grid takes 4 per row at xl,
  // 2 per row at md, and scrolls on mobile, so 8 renders as two clean
  // rows rather than a cramped strip. excludeIds hands this set to the
  // category tabs below so the two sections don't open on the same
  // garments.
  const newArrivals = [...inStock]
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || a.title.localeCompare(b.title),
    )
    .slice(0, 8);
  const newArrivalIds = new Set(newArrivals.map((p) => p.id));

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
        id="main-content"
        tabIndex={-1}
        className="labelashb-grain flex flex-1 flex-col bg-labelashb-ivory"
      >
        <JsonLd data={websiteJsonLd} />

        <section className="relative flex flex-col border-b border-labelashb-border px-6 sm:px-8 md:min-h-[min(760px,max(28rem,calc(100svh-10rem)))] md:overflow-hidden md:px-0">
          <HeroCarousel slides={heroSlides} fullSlides={heroFullSlides} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-labelashb-wine/90 via-labelashb-wine/35 to-transparent md:block"
          />
          <div className="relative py-8 md:mt-auto md:p-10 lg:p-16">
            <div className="max-w-2xl md:w-fit md:rounded-labelashb-sm md:bg-labelashb-wine/85 md:p-6">
              <p className="text-labelashb-eyebrow uppercase tracking-[0.28em] text-labelashb-accent md:text-labelashb-gold">
                Handmade in Gurgaon, India
              </p>
              <h1 className="font-labelashb-serif mt-4 text-labelashb-display text-labelashb-ink md:text-[clamp(2.5rem,1.2rem+3.5vw,4.5rem)] md:text-labelashb-accent-foreground">
                Quietly confident.
              </h1>
              <span aria-hidden="true" className="mt-5 block h-px w-14 bg-labelashb-olive-light md:bg-labelashb-gold" />
              <p className="mt-5 max-w-lg text-labelashb-body-lg text-labelashb-ink-soft md:text-labelashb-accent-foreground">
                Eight people in our Gurgaon atelier cut and finish each piece to order in hand-embroidered linen, cotton, and silk.
              </p>
              <Button href="/products" variant="primary" className="mt-8 md:bg-labelashb-accent-foreground md:text-labelashb-wine md:hover:bg-white md:focus-visible:ring-labelashb-gold">
                Explore the collection
              </Button>
            </div>
          </div>
        </section>

        {/* Oct 31 2026 layout brief: vertical rhythm trimmed generous ->
            standard (was up to 8rem gap AND 8rem padding - oversized
            empty bands between sections). */}
        <div className="flex flex-col gap-labelashb-section-standard py-labelashb-section-standard">
          {/* The New Collection lookbook section and /collection routes
              were retired when every lookbook garment found a home: the
              hero (HERO_SLUGS), or presentation imagery on the remaining
              mannequin-shot products (PRESENTATION_SWAPS,
              product-reshoots.ts). One garment, one place on the site -
              the shop below now carries all of them. */}

          {/* New in the atelier - Phase 3 merchandising lane. Shared
              .labelashb-shell container; NewInLane renders the desktop
              grid (2-up, 4-up from xl) and, below md, an intentional
              one-complete-card carousel with arrows (Oct 31 refinement
              pass - no more clipped next-card fragments). */}
          {newArrivals.length > 0 && (
            <section className="px-6 sm:px-8 lg:px-10" aria-labelledby="new-in-heading">
              <div className="labelashb-shell">
                <Reveal>
                  <h2
                    id="new-in-heading"
                    className="font-labelashb-serif text-labelashb-h2 text-labelashb-ink"
                  >
                    New in the atelier
                  </h2>
                  <div className="mt-labelashb-section-compact">
                    <NewInLane products={newArrivals.map(toExpandedCard)} />
                  </div>
                </Reveal>
              </div>
            </section>
          )}

          {/* Shop by category - tabs derived from the live catalog.
              excludeIds keeps the opening row off the pieces the New-in
              lane above already shows. */}
          <section className="px-6 sm:px-8 lg:px-10" aria-label="Shop by category">
            <div className="w-full">
              <h2 className="sr-only">Browse by category</h2>
              <TabbedProductCarousel
                products={inStock.map(toExpandedCard)}
                categories={DISPLAY_CATEGORIES.filter((category) => inStock.some((p) => p.category === category))}
                excludeIds={newArrivalIds}
              />
            </div>
          </section>

          {/* Fabric collections - Linen / Cotton / Silk, real catalog
              photography and distribution (PLACEHOLDER-POLICY.md), not a
              1:1 copy of a reference site's own fabric groupings. */}
          {materialShowcase.length > 0 && (
            <section className="px-6 sm:px-8 lg:px-10" aria-labelledby="fabric-heading">
              {/* Oct 31 layout brief: Linen/Cotton/Silk as three equal
                  columns across the shared shell (grid mode below md is
                  the comfortable scroll row). */}
              <div className="labelashb-shell">
                <h2
                  id="fabric-heading"
                  className="font-labelashb-serif text-labelashb-h2 text-labelashb-ink"
                >
                  Shop by fabric
                </h2>
                <div className="mt-labelashb-section-compact">
                  <HorizontalImageScroller images={materialShowcase} labelledBy="fabric-heading" layout="grid" />
                </div>
              </div>
            </section>
          )}

          {/* Category promo grid - 3 real tiles (Dresses / Tops / Co-ord
              Sets), never padded to a 4th (PLACEHOLDER-POLICY.md). */}
          {categoryTiles.length > 0 && (
            <section className="px-6 sm:px-8 lg:px-10" aria-labelledby="categories-heading">
              <div className="w-full">
                <h2
                  id="categories-heading"
                  className="font-labelashb-serif text-labelashb-h2 text-labelashb-ink"
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

          {/* Our Studio - real photography supplied by the client (Sep
              2026, cropped to the 4:5 card frame at import into
              public/atmosphere/), one carousel per window (client ask,
              Sep 23): Fabric x2, Workspace x4, By hand x2 - all eight
              photos from the batch, each appearing once. Rotation,
              hover/focus pause and reduced-motion handling mirror
              ProcessCarousel (StudioPanels.tsx). */}
          <section
            className="bg-labelashb-ground-alt px-6 py-labelashb-section-standard sm:px-8 lg:px-10"
            aria-labelledby="studio-heading"
          >
            {/* Oct 31 layout brief: shared shell so the studio row spans
                the desktop width like the other sections; heading and
                grid share the container so their left edges align. */}
            <div className="labelashb-shell">
              <h2
                id="studio-heading"
                className="font-labelashb-serif text-labelashb-h2 text-labelashb-ink"
              >
                Our studio
              </h2>
              <div className="mt-labelashb-section-compact">
                <StudioPanels
                  panels={[
                    {
                      caption: "Fabric",
                      note: "It starts with the cloth. Handloom linen, mulberry silk, cotton that breathes.",
                      views: [
                        { src: "/atmosphere/studio-fabric.jpg", alt: "Hands sorting patterned fabrics in the Label AshB studio" },
                        { src: "/atmosphere/studio-fabric-2.jpg", alt: "An arrangement of colorful printed fabrics" },
                      ],
                    },
                    {
                      caption: "Workspace",
                      note: "One room in Gurgaon. Eight people. Zero shortcuts.",
                      views: [
                        { src: "/atmosphere/studio-workspace.jpg", alt: "A maker working at a sewing machine in the Label AshB studio" },
                        { src: "/atmosphere/studio-workspace-2.jpg", alt: "Two makers inspecting a patterned garment" },
                        { src: "/atmosphere/studio-workspace-3.jpg", alt: "A maker sketching a garment design" },
                        { src: "/atmosphere/studio-workspace-4.jpg", alt: "The Label AshB studio team" },
                      ],
                    },
                    {
                      caption: "By hand",
                      note: "We embroider each motif stitch by stitch, using techniques Binita learned as a girl.",
                      views: [
                        { src: "/atmosphere/studio-handwork.jpg", alt: "Hands guiding patterned fabric through a sewing machine" },
                        { src: "/atmosphere/studio-handwork-2.jpg", alt: "A maker holding a blue garment in the studio" },
                      ],
                    },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Why Label AshB - split section, real product photography and
              copy grounded in confirmed brand positioning (PRODUCT.md). */}
          <section className="px-6 sm:px-8 lg:px-10" aria-labelledby="why-heading">
            {/* Oct 31 refinement pass: image 40% / text 60%, columns
                top-aligned so the heading rows line up; text column keeps
                its comfortable max-w-xl measure. Stacks naturally below
                md. */}
            <div className="labelashb-shell flex flex-col gap-10 md:flex-row md:items-start md:gap-16">
              {whyUsImage && (
                <div className="relative aspect-labelashb-product w-full overflow-hidden bg-labelashb-ground-alt md:w-[40%]">
                  <div className="relative h-full w-full">
                    <Image
                      src={whyUsImage.url}
                      alt={whyUsImage.altText || whyUsProduct?.title || ""}
                      fill
                      sizes="(min-width: 768px) 40vw, 100vw"
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              <div className="md:max-w-xl">
                <h2
                  id="why-heading"
                  className="font-labelashb-serif text-labelashb-h2 text-labelashb-ink"
                >
                  Why Label AshB
                </h2>
                {/* space-y-8 (Oct 31 editorial pass): clearer separation
                    between the brand's key points per the layout brief. */}
                <dl className="mt-8 space-y-8">
                  {/* Names and numbers confirmed by Abhishek (brand
                      questions, Oct 19 2026) - team consent to being
                      named was given with the same answers. */}
                  <div>
                    <dt className="text-labelashb-body-lg text-labelashb-ink">Made to order</dt>
                    <dd className="mt-1 text-labelashb-body text-labelashb-ink-soft">
                      We cut and finish made-to-order pieces in your size.
                      Depending on the design, they may take 10 to 12 days to ship.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-labelashb-body-lg text-labelashb-ink">
                      A small atelier, not a factory
                    </dt>
                    <dd className="mt-1 text-labelashb-body text-labelashb-ink-soft">
                      Eight of us in one Gurgaon workshop: Bimal, our master
                      tailor of 25 years; Rampravesh; Raja Ali, who runs the
                      floor; Manju and Jyoti; and Binita, who inspects every
                      single piece.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-labelashb-body-lg text-labelashb-ink">Fabric first</dt>
                    <dd className="mt-1 text-labelashb-body text-labelashb-ink-soft">
                      Damask, jacquard, cambric, twill and herringbone
                      linens; mulberry, crepe and Tussar silks; pure cottons
                      - chosen for feel and fall before anything else.
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
                      More than half the workshop&apos;s power is generated
                      on our own roof.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-labelashb-body-lg text-labelashb-ink">Fair opportunity</dt>
                    <dd className="mt-1 text-labelashb-body text-labelashb-ink-soft">
                      Skilled, steady, respected work for the people who
                      make your clothes.
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

          {/* Process - real atelier moments, sequenced from cutting through
              draping and stitching. Each stage rotates through three views
              while retaining direct, accessible image controls. */}
          <section
            className="bg-labelashb-ground-alt px-6 py-labelashb-section-standard sm:px-8 lg:px-10"
            aria-labelledby="process-heading"
          >
            {/* Oct 31 layout brief: shared shell - the three process
                cards distribute across the wider container. Card
                internals (ratio, labels, controls) untouched. */}
            <div className="labelashb-shell">
              <h2
                id="process-heading"
                className="font-labelashb-serif text-labelashb-h2 text-labelashb-ink"
              >
                From paper to piece
              </h2>
              <div className="mt-labelashb-section-compact grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {processStages.map((stage, i) => (
                  <ProcessCarousel key={stage.title} stage={stage} step={i + 1} />
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials - no real customer quotes exist yet to put in a
              scroller; a placeholder quote would assert something specific
              and unverified, which this brand's quiet voice doesn't do
              (PLACEHOLDER-POLICY.md / PRODUCT.md). Quiet text mode instead,
              swap to the real carousel once Binita sends quotes. */}
          {/* Hidden Oct 29 2026 for launch polish: a "coming soon" strip
              reads as unfinished. Flip SHOW_CUSTOMER_STORIES once real
              quotes exist. */}
          {SHOW_CUSTOMER_STORIES && (
            <section className="px-6 sm:px-10 lg:px-16" aria-label="Customer stories">
              <div className="mx-auto max-w-6xl">
                <HorizontalImageScroller
                  mode="label"
                  text="Customer stories are being gathered - real voices from the women wearing Label AshB, coming soon."
                />
              </div>
            </section>
          )}

          {/* Newsletter */}
          <section className="px-6 sm:px-10 lg:px-16" aria-label="Newsletter signup">
            <NewsletterSignup whatsapp={facts.contact.whatsapp} />
          </section>
        </div>
      </main>

      <WhatsAppFloat phone={facts.contact.whatsapp} />
    </>
  );
}
