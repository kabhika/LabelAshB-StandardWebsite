import Image from "next/image";
import Link from "next/link";
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
import { ProductCardExpanded } from "@/components/catalog/ProductCardExpanded";
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
  Linen: "Damask, jacquard, cambric, twill and herringbone - woven to breathe through Indian summers.",
  Cotton: "Pure cotton, softer with every wash.",
  Silk: "Mulberry, crepe and Tussar silk - each with its own fall.",
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

export default async function Home() {
  const catalog = await getCatalog();
  const inStock = catalog.filter((p) => p.inStock);
  const categoryTiles = pickCategoryTiles(catalog);
  const materialShowcase = pickMaterialShowcase(catalog);

  // "New in the atelier" lane (Phase 3, Oct 2026): the four most
  // recently created in-stock products. created_at comes from Supabase -
  // the Shopify-era rows all share the migration timestamp, so until new
  // products are added the tie-break (title) makes the order stable
  // rather than meaningful; the lane itself still shows real, in-stock
  // pieces. excludeIds hands this set to the category tabs below so the
  // two sections don't open on the same garments.
  const newArrivals = [...inStock]
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || a.title.localeCompare(b.title),
    )
    .slice(0, 4);
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
        className="labelashb-grain flex flex-1 flex-col bg-labelashb-ivory"
      >
        <JsonLd data={websiteJsonLd} />

        {/* Hero, split by breakpoint (Oct 30 2026 night, client: "let the
            hero image take on this whole section - it should be of the
            full screen; don't crop the photos from the side"):
            - md+: ONE uncropped landscape photo fills the whole section
              edge to edge (h = viewport minus the ~160px announcement +
              header band), copy overlaid on a chocolate scrim. No dead
              flanks, no side-cropped 4:5 pair.
            - below md: the stacked copy + 4:5 photo hero is KEPT - a
              landscape photo in a phone-width full-bleed frame would
              crop 60%+ off the model's sides, so mobile keeps the
              subject-centered 4:5 crops and the tuned fold budget
              (46svh image, CTA above the fold). */}
        {/* Mobile hero (below md) */}
        <section className="border-b border-labelashb-border px-6 sm:px-8 md:hidden">
          <div className="flex flex-col">
            <div className="order-2 flex flex-1 flex-col justify-center py-8">
              <Reveal>
                <p className="text-labelashb-eyebrow uppercase tracking-[0.28em] text-labelashb-accent">
                  Handmade in Gurgaon, India
                </p>
                <h1 className="font-labelashb-serif mt-4 text-labelashb-display text-labelashb-ink">
                  Quietly confident.
                </h1>
                <span aria-hidden="true" className="mt-5 block h-px w-14 bg-labelashb-olive-light" />
                <p className="mt-5 max-w-lg text-labelashb-body-lg text-labelashb-ink-soft">
                  Hand-embroidered linen, cotton and silk - cut and finished
                  to order in our atelier, by eight people who care about
                  every seam.
                </p>
                <div className="mt-8">
                  <Button href="/products" variant="primary">
                    Explore the collection
                  </Button>
                </div>
              </Reveal>
            </div>

            {/* Plain-CSS fade+rise (globals.css .labelashb-reveal), not the
                Reveal component: Reveal's motion.div applies an inline
                transform, which becomes a containing block for this column's
                absolutely-positioned carousel and collapses its h-full
                chain to 0 height. */}
            <div
              className="labelashb-reveal relative order-1 mx-auto aspect-[4/5] h-[min(46svh,120vw)] w-auto"
              style={{ animationDelay: "0.15s" }}
            >
              <HeroCarousel slides={heroSlides} />
            </div>
          </div>
        </section>

        {/* Desktop hero (md+): full-bleed. 10rem ≈ the announcement bar +
            header band above (py-4 + h-24 logo + bar) - keep in sync if
            the header heights change. Oct 31 refinement pass: capped at
            760px (client: "reduce the overall hero height... bring the
            garments, headline and action into focus sooner") - on tall
            viewports the band no longer towers past the photo. */}
        <section className="relative hidden h-[calc(100svh-10rem)] overflow-hidden border-b border-labelashb-border md:block md:max-h-[760px]">
          <HeroCarousel slides={heroSlides} fullSlides={heroFullSlides} />
          {/* Chocolate scrim for the overlaid copy - strongest at the
              bottom-left where the text sits, fading out by mid-frame. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-labelashb-wine/85 via-labelashb-wine/30 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-labelashb-wine/40 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-10 lg:p-16">
            <div className="max-w-2xl">
              <p className="text-labelashb-eyebrow uppercase tracking-[0.28em] text-labelashb-gold">
                Handmade in Gurgaon, India
              </p>
              <h1 className="font-labelashb-serif mt-4 text-[clamp(2.5rem,1.2rem+3.5vw,4.5rem)] text-labelashb-accent-foreground">
                Quietly confident.
              </h1>
              <span aria-hidden="true" className="mt-5 block h-px w-14 bg-labelashb-gold" />
              <p className="mt-5 max-w-lg text-labelashb-body-lg text-labelashb-accent-foreground/85">
                Hand-embroidered linen, cotton and silk - cut and finished
                to order in our atelier, by eight people who care about
                every seam.
              </p>
              {/* Inverted primary CTA (Button.tsx's fills assume the
                  champagne ground; on the photo scrim the warm ivory
                  fills instead, chocolate label). */}
              <Link
                href="/products"
                className="mt-8 inline-flex items-center justify-center rounded-labelashb-sm bg-labelashb-accent-foreground px-6 py-3 text-labelashb-body font-medium text-labelashb-wine transition-transform duration-150 hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-gold focus-visible:ring-offset-2"
              >
                Explore the collection
              </Link>
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
                    <NewInLane products={newArrivals} />
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
              <TabbedProductCarousel products={catalog} excludeIds={newArrivalIds} />
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
                        { src: "/atmosphere/studio-fabric.jpg", alt: "Rolls of fabric in the Label AshB studio" },
                        { src: "/atmosphere/studio-fabric-2.jpg", alt: "A garment in progress hanging in the Label AshB studio" },
                      ],
                    },
                    {
                      caption: "Workspace",
                      note: "One room in Gurgaon. Eight people. Zero shortcuts.",
                      views: [
                        { src: "/atmosphere/studio-workspace.jpg", alt: "The Label AshB worktable with tools and sewing machine" },
                        { src: "/atmosphere/studio-workspace-2.jpg", alt: "Sewing machine at work in the Label AshB studio" },
                        { src: "/atmosphere/studio-workspace-3.jpg", alt: "Marking fabric for cutting at the Label AshB studio" },
                        { src: "/atmosphere/studio-workspace-4.jpg", alt: "A garment being shaped on the dress form" },
                      ],
                    },
                    {
                      caption: "By hand",
                      note: "Every motif rises stitch by stitch - embroidery the way Binita learned it as a girl.",
                      views: [
                        { src: "/atmosphere/studio-handwork.jpg", alt: "Hands at hand-stitching in the Label AshB studio" },
                        { src: "/atmosphere/studio-handwork-2.jpg", alt: "Pressing a garment during finishing" },
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
                      className="object-cover"
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
                      Your piece doesn&apos;t exist until you order it. Cut
                      and finished to your size over 10 to 12 days - never
                      pulled from a warehouse shelf.
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
