import Link from "next/link";
import Image from "next/image";
import {
  DISPLAY_CATEGORIES,
  MATERIAL_GROUPS,
  getCatalog,
  getProductByHandle,
} from "@/lib/shopify/catalog";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductCardExpanded } from "@/components/catalog/ProductCardExpanded";
import { Reveal } from "@/components/motion/Reveal";
import { PaletteGrid } from "@/components/dev/PaletteGrid";
import { SiteNav, type NavLink } from "@/components/layout/SiteNav";
import { MobileNav } from "@/components/layout/MobileNav";
import facts from "../../../_knowledge/facts.json";

// Same derive-from-live-catalog pattern as SiteHeader.tsx's getNavLinks -
// duplicated locally rather than exported from SiteHeader, since this
// comparison must not touch the live header module at all.
async function getNavLinks(): Promise<{ categories: NavLink[]; collections: NavLink[] }> {
  const catalog = await getCatalog();
  const inStock = catalog.filter((p) => p.inStock);

  const categories = DISPLAY_CATEGORIES.filter((category) =>
    inStock.some((p) => p.category === category),
  ).map((category) => ({
    label: category,
    href: `/products?category=${encodeURIComponent(category)}`,
  }));

  const collections = MATERIAL_GROUPS.filter(({ slugs }) =>
    inStock.some((p) => p.materials.some((m) => slugs.includes(m))),
  ).map(({ label, slugs }) => ({
    label,
    href: `/products?material=${encodeURIComponent(slugs.join(","))}`,
  }));

  return { categories, collections };
}

// Shared logo + nav markup for both nav-band candidates below - identical
// content (same logo asset, same live categories/collections, same
// SiteNav/MobileNav components as the real header) so only the band
// treatment itself differs between the two, keeping the comparison fair.
function NavBandContent({
  categories,
  collections,
}: {
  categories: NavLink[];
  collections: NavLink[];
}) {
  return (
    <div className="relative px-6 py-2 sm:py-4">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center">
        <div />
        <Link
          href="/"
          aria-label="Label AshB, home"
          className="inline-block justify-self-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-ground focus-visible:ring-offset-1"
        >
          <Image
            src="/label-ashb-logo-transparent.png"
            alt="Label AshB"
            width={576}
            height={517}
            className="h-12 w-auto sm:h-24"
          />
        </Link>
        <div className="justify-self-end">
          <MobileNav categories={categories} collections={collections} />
        </div>
      </div>

      <div className="mt-3 hidden justify-center sm:flex">
        <SiteNav categories={categories} collections={collections} />
      </div>
    </div>
  );
}

export default async function StyleTilePage() {
  // Style tile grounds its product card in a real, live catalog item —
  // never hardcoded product data, even at this stage.
  const product = await getProductByHandle(
    "the-indigo-swallow",
  );
  // Isolated preview for ProductCardExpanded (homepage/collection card,
  // not wired into page.tsx yet) — real catalog data, first three
  // products so the hover-cycle gallery has something with 2+ photos to
  // demonstrate.
  const catalog = await getCatalog();
  const previewProducts = catalog.slice(0, 3);
  const { categories: navCategories, collections: navCollections } = await getNavLinks();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 space-y-24">
      <header>
        <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft">
          Style tile — Studio Minimal
        </p>
        <h1 className="text-labelashb-h1 text-labelashb-ink">Label AshB</h1>
      </header>

      {/* Hero treatment */}
      <section aria-label="Hero treatment example">
        <h2 className="text-labelashb-h3 text-labelashb-ink-soft mb-6">
          Hero treatment
        </h2>
        <div className="border border-labelashb-border bg-labelashb-ground-alt px-10 py-20">
          <Reveal>
            <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft mb-4">
              Handcrafted in India
            </p>
            <p className="text-labelashb-display text-labelashb-ink max-w-3xl">
              {facts.brand.name}
            </p>
            <p className="mt-6 max-w-xl text-labelashb-body-lg text-labelashb-ink-soft">
              {facts.brand.shortDescription}
            </p>
            <div className="mt-8">
              <Button variant="primary">Shop the collection</Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Nav-band treatment candidates - comparison only, not wired into
          SiteHeader.tsx. Both reuse the exact same logo asset and live
          categories/collections (NavBandContent) so only the background
          treatment differs between them. */}
      <section aria-labelledby="nav-band-heading">
        <h2
          id="nav-band-heading"
          className="text-labelashb-h3 text-labelashb-ink-soft mb-6"
        >
          Nav band treatment candidates
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="border border-labelashb-border">
            <p className="border-b border-labelashb-border bg-labelashb-ground-alt px-4 py-2 text-labelashb-small text-labelashb-ink-soft">
              1. Diagonal jewel sweep
            </p>
            {/* Diagonal wine -> ink -> indigo blend, not a flat left-to-
                right fade - the existing labelashb-grain texture sits on
                top of this gradient exactly like it already does on the
                shipped header (its ::before noise layer paints above an
                element's own background, below real content). */}
            <div
              className="labelashb-grain relative z-10"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--color-labelashb-wine), var(--color-labelashb-ink), var(--color-labelashb-indigo))",
              }}
            >
              <NavBandContent categories={navCategories} collections={navCollections} />
            </div>
          </div>

          <div className="border border-labelashb-border">
            <p className="border-b border-labelashb-border bg-labelashb-ground-alt px-4 py-2 text-labelashb-small text-labelashb-ink-soft">
              2. Satin light sweep
            </p>
            {/* Solid ink base; the diagonal light band is a direct child
                of the grain element (same trick as the shipped header's
                logo highlight), so labelashb-grain's own `> *` rule lifts
                it to z-index: 1 - same tier as the nav content below, but
                painted first so it sits above the noise (z-index: 0) and
                behind the real content, per the brief. That same `> *`
                rule also sets `position: relative` on every direct child,
                and since it's unlayered CSS it beats the `absolute`
                utility below regardless of source order - `!absolute`
                forces it back with !important (see SiteHeader.tsx, same
                bug there). */}
            <div className="labelashb-grain relative z-10 bg-labelashb-ink">
              <div
                aria-hidden="true"
                className="pointer-events-none !absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(115deg, transparent 0%, transparent 38%, rgba(247,242,233,0.16) 46%, rgba(247,242,233,0.16) 63%, transparent 71%, transparent 100%)",
                }}
              />
              <NavBandContent categories={navCategories} collections={navCollections} />
            </div>
          </div>

          <div className="border border-labelashb-border">
            <p className="border-b border-labelashb-border bg-labelashb-ground-alt px-4 py-2 text-labelashb-small text-labelashb-ink-soft">
              3. Spotlight vignette
            </p>
            {/* Solid ink base, both extra layers on the container's own
                backgroundImage (not a child div) - sidesteps the
                labelashb-grain `> *` bug entirely, since a box's own
                background always paints before its positioned children
                (the ::before noise layer included) regardless of z-index.
                Layer 1 (paints on top): gold radial glow centered behind
                the logo, same hue as the shipped header's highlight
                (rgba 201,162,90) but ~3x the peak opacity - that one was
                confirmed near-invisible at 0.16, this is 0.55. Layer 2:
                plain left/right edge darkening (not a radial vignette,
                which would also darken top/bottom) via two-stop linear
                gradients from each side. */}
            <div
              className="labelashb-grain relative z-10 bg-labelashb-ink"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 50% 55%, rgba(201,162,90,0.55) 0%, rgba(201,162,90,0.32) 20%, rgba(201,162,90,0) 55%), linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.55) 100%)",
              }}
            >
              <NavBandContent categories={navCategories} collections={navCollections} />
            </div>
          </div>

          <div className="border border-labelashb-border">
            <p className="border-b border-labelashb-border bg-labelashb-ground-alt px-4 py-2 text-labelashb-small text-labelashb-ink-soft">
              4. Restrained gold hairline
            </p>
            {/* No gradient across the band, grain texture only. The gold
                line is an inset box-shadow on the container itself, not a
                child div - same reason as candidate 3, guarantees it
                renders without touching the `> *` position/z-index bug at
                all. Solid, not faded, per the "quiet" brief. */}
            <div
              className="labelashb-grain relative z-10 bg-labelashb-ink"
              style={{ boxShadow: "inset 0 -2px 0 0 rgba(201,162,90,0.9)" }}
            >
              <NavBandContent categories={navCategories} collections={navCollections} />
            </div>
          </div>
        </div>
      </section>

      {/* Palette */}
      <section aria-labelledby="palette-heading">
        <h2 id="palette-heading" className="text-labelashb-h3 text-labelashb-ink-soft mb-6">
          Palette
        </h2>
        <PaletteGrid />
      </section>

      {/* Type scale */}
      <section aria-labelledby="type-heading">
        <h2 id="type-heading" className="text-labelashb-h3 text-labelashb-ink-soft mb-6">
          Type scale
        </h2>
        <div className="space-y-6">
          <p className="text-labelashb-display text-labelashb-ink">Display 72</p>
          <p className="text-labelashb-h1 text-labelashb-ink">Heading 1 — 48</p>
          <p className="text-labelashb-h2 text-labelashb-ink">Heading 2 — 32</p>
          <p className="text-labelashb-h3 text-labelashb-ink">Heading 3 — 24</p>
          <p className="text-labelashb-body-lg text-labelashb-ink">
            Body large — 18. Crafted from luxurious, breathable pure linen, silk, and cotton.
          </p>
          <p className="text-labelashb-body text-labelashb-ink">
            Body — 16. Every piece is made with time, care, and a clear eye for detail.
          </p>
          <p className="text-labelashb-small text-labelashb-ink-soft">
            Small — 14. Free standard shipping on dress orders within India.
          </p>
          <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft">
            Eyebrow — 12 uppercase tracked
          </p>
        </div>
      </section>

      {/* Buttons */}
      <section aria-labelledby="buttons-heading">
        <h2 id="buttons-heading" className="text-labelashb-h3 text-labelashb-ink-soft mb-6">
          Buttons — hover / active states are live, try them
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="primary" disabled>
            Primary disabled
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="secondary" disabled>
            Secondary disabled
          </Button>
        </div>
      </section>

      {/* Product card */}
      <section aria-labelledby="card-heading">
        <h2 id="card-heading" className="text-labelashb-h3 text-labelashb-ink-soft mb-6">
          Product card — live data ({product ? product.handle : "fetch failed"})
        </h2>
        {product ? (
          <ProductCard product={product} />
        ) : (
          <p className="text-labelashb-error">
            Could not load a live product for this card. Check Storefront API
            connectivity.
          </p>
        )}
      </section>

      {/* ProductCardExpanded preview — isolated, not wired into page.tsx */}
      <section aria-labelledby="card-expanded-heading">
        <h2
          id="card-expanded-heading"
          className="text-labelashb-h3 text-labelashb-ink-soft mb-6"
        >
          Product card expanded — hover-swap gallery, size pills, quick add
          (live data)
        </h2>
        {previewProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
            {previewProducts.map((p) => (
              <ProductCardExpanded key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-labelashb-error">
            Could not load catalog products for this preview.
          </p>
        )}
      </section>

      {/* Form field with error state */}
      <section aria-labelledby="form-heading">
        <h2 id="form-heading" className="text-labelashb-h3 text-labelashb-ink-soft mb-6">
          Form field — error state
        </h2>
        <div className="max-w-sm">
          <label
            htmlFor="style-tile-email"
            className="block text-labelashb-small text-labelashb-ink mb-2"
          >
            Email address
          </label>
          <input
            id="style-tile-email"
            type="email"
            defaultValue="not-an-email"
            aria-invalid="true"
            aria-describedby="style-tile-email-error"
            className="w-full border border-labelashb-error bg-labelashb-error-soft px-4 py-3 text-labelashb-body text-labelashb-ink outline-none focus:ring-2 focus:ring-labelashb-error"
          />
          <p
            id="style-tile-email-error"
            className="mt-2 text-labelashb-small text-labelashb-error"
          >
            Enter a valid email address.
          </p>
        </div>
      </section>
    </main>
  );
}
