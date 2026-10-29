import Image from "next/image";
import type { Metadata } from "next";
import {
  DISPLAY_CATEGORIES,
  MATERIAL_GROUPS,
  getCatalog,
  type NormalizedProduct,
} from "@/lib/shopify/catalog";
import {
  collectionHeroDetails,
  collectionHeroSlides,
} from "@/data/new-collection";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/shared/JsonLd";
import { HeroCarousel } from "@/components/home/HeroCarousel";
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
const heroDetails = collectionHeroDetails();

// These lead images are deliberately curated from the supplied Drive garment
// folders, rather than selected by catalogue insertion order. Each one is a
// front-facing, full-length view, so the homepage does not fall back to a back
// view or a torso-only crop as the catalogue changes.
const homepageFeatureImages = {
  Silk: {
    url: "/collection/26-ivory-drift-one-shoulder-modal-silk-dress/01.jpg",
    alt: "Front view of the Ivory Drift modal silk dress",
  },
  Dresses: {
    url: "/collection/28-scarlet-ember-linen-halter-dress/01.jpg",
    alt: "Front view of the Scarlet Ember linen halter dress",
  },
  Tops: {
    url: "/collection/23-celeste-line-linen-top/01.jpg",
    alt: "Front view of the Celeste Line linen top",
  },
} as const;

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
    const curatedImage = homepageFeatureImages[category as keyof typeof homepageFeatureImages];
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
    const curatedImage = homepageFeatureImages[label as keyof typeof homepageFeatureImages];
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

        {/* Hero - Apple-style centered composition: the whole hero (copy
            + imagery) sits in a capped, centered column, so on very wide
            screens the surplus becomes white space on the OUTER flanks
            of the page - never more image stretch. Cap is 1580px
            (Sep 23: trimmed from 1720 so the width-capped companion
            panel and the primary fill the row edge to edge - at 1720 a
            slack strip opened on the right. 1580 still keeps flanks
            much tighter than the original 1440). The full-width
            hairline below stays full-bleed - only the content is
            capped.
            Inside the cap: copy column (max 520px, biased upward) and
            the image area. The carousel pairs a fixed-2:3 primary frame
            (the photos are tight full-body shots - measured 0-6%
            headroom, 2-6% floor - so a wider box would make
            object-cover eat head/hem) with a flex-1 companion panel of
            the same garment's close-up detail (HeroCarousel.tsx). The
            image column stretches to the row height (70vh floor, 780px
            ceiling) with a 200px companion floor, so the panels fill
            the band with no dead space at any screen size. */}
        <section className="border-b border-labelashb-border">
          {/* No min-height: the row hugs its tallest child (the 70vh/
              max-780px image column). A former md:min-h-[85vh] left a
              large dead ivory band below the imagery on tall screens
              (client: "reduce this gap further", Sep 1 2026). */}
          <div className="mx-auto flex max-w-[1580px] flex-col md:flex-row">
            {/* pb-[10vh] biases the copy block above dead-center (client
                note: "a little bit upward"); pr-6 at lg keeps the copy
                close to the first image panel. */}
            <div className="order-2 flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 sm:py-16 md:order-1 md:px-14 md:pb-[10vh] lg:max-w-[520px] lg:pl-16 lg:pr-6">
              <Reveal>
                {/* "Quietly confident." is Binita's own founding line ("the
                    woman wearing the garment feels quietly confident") -
                    approved via CAPTIONS-DRAFT.md option 1a, Oct 19 2026.
                    Eyebrow wording: client asked for "Slow made in Gurgaon"
                    -> "meticulously handcrafted in Gurgaon" in review, then
                    simplified to "Handmade in Gurgaon, India" after seeing
                    it rendered (Oct 19, second look). "Handmade" is also the
                    one brand-feel word Binita chose in the questionnaire.
                    text-labelashb-display is viewport-relative; the md:/xl:
                    overrides are the same container-width correction the old
                    headline needed, recalibrated for this shorter line. */}
                <p className="text-labelashb-eyebrow uppercase tracking-[0.28em] text-labelashb-accent">
                  Handmade in Gurgaon, India
                </p>
                <h1 className="font-labelashb-serif mt-4 text-labelashb-display text-labelashb-ink md:text-[clamp(2.5rem,1rem+4vw,4rem)] xl:text-[clamp(3rem,1.2rem+4.5vw,4.75rem)]">
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
              className="labelashb-reveal relative order-1 mx-auto aspect-[2/3] h-[min(68svh,150vw)] w-auto md:order-2 md:mx-0 md:aspect-auto md:h-auto md:min-h-[70vh] md:max-h-[780px] lg:flex-[1_0_auto]"
              style={{ animationDelay: "0.15s" }}
            >
              <HeroCarousel slides={heroSlides} details={heroDetails} />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-labelashb-section-generous py-labelashb-section-generous">
          {/* The New Collection lookbook section and /collection routes
              were retired when every lookbook garment found a home: the
              hero (HERO_SLUGS), or presentation imagery on the remaining
              mannequin-shot products (PRESENTATION_SWAPS,
              product-reshoots.ts). One garment, one place on the site -
              the shop below now carries all of them. */}

          {/* New in the atelier - Phase 3 merchandising lane. Same card
              row treatment as the category tabs below it (snap-scroll
              track, 4-up at xl) so the two read as one system. */}
          {newArrivals.length > 0 && (
            <section className="px-6 sm:px-10 lg:px-16" aria-labelledby="new-in-heading">
              <div className="mx-auto max-w-6xl">
                <Reveal>
                  <h2
                    id="new-in-heading"
                    className="font-labelashb-serif inline-block border-b-2 border-labelashb-olive-light pb-2 text-labelashb-h2 text-labelashb-ink"
                  >
                    New in the atelier
                  </h2>
                  <div className="mt-labelashb-section-compact flex snap-x snap-mandatory gap-labelashb-carousel-gap overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {newArrivals.map((product) => (
                      <div
                        key={product.id}
                        className="w-64 flex-none snap-start sm:w-72 xl:w-[calc((100%-3*var(--spacing-labelashb-carousel-gap))/4)]"
                      >
                        <ProductCardExpanded product={product} />
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            </section>
          )}

          {/* Shop by category - tabs derived from the live catalog.
              excludeIds keeps the opening row off the pieces the New-in
              lane above already shows. */}
          <section className="px-6 sm:px-10 lg:px-16" aria-label="Shop by category">
            <div className="mx-auto max-w-6xl">
              <TabbedProductCarousel products={catalog} excludeIds={newArrivalIds} />
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
                  className="font-labelashb-serif inline-block border-b-2 border-labelashb-olive-light pb-2 text-labelashb-h2 text-labelashb-ink"
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
                  className="font-labelashb-serif inline-block border-b-2 border-labelashb-olive-light pb-2 text-labelashb-h2 text-labelashb-ink"
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
            className="bg-labelashb-ground-alt px-6 py-labelashb-section-standard sm:px-10 lg:px-16"
            aria-labelledby="studio-heading"
          >
            <div className="mx-auto max-w-6xl">
              <h2
                id="studio-heading"
                className="font-labelashb-serif inline-block border-b-2 border-labelashb-olive-light pb-2 text-labelashb-h2 text-labelashb-ink"
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
          <section className="px-6 sm:px-10 lg:px-16" aria-labelledby="why-heading">
            <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-center md:gap-16">
              {whyUsImage && (
                <div className="relative aspect-labelashb-product w-full overflow-hidden bg-labelashb-ivory p-4 md:w-[42%]">
                  <div className="relative h-full w-full">
                    <Image
                      src={whyUsImage.url}
                      alt={whyUsImage.altText || whyUsProduct?.title || ""}
                      fill
                      sizes="(min-width: 768px) 42vw, 100vw"
                      className="object-cover"
                    />
                  </div>
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
            className="bg-labelashb-ground-alt px-6 py-labelashb-section-standard sm:px-10 lg:px-16"
            aria-labelledby="process-heading"
          >
            <div className="mx-auto max-w-6xl">
              <h2
                id="process-heading"
                className="font-labelashb-serif inline-block border-b-2 border-labelashb-olive-light pb-2 text-labelashb-h2 text-labelashb-ink"
              >
                From paper to piece
              </h2>
              <div className="mt-labelashb-section-compact grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {processStages.map((stage) => (
                  <ProcessCarousel key={stage.title} stage={stage} />
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
