import { getCatalog, getProductByHandle } from "@/lib/shopify/catalog";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductCardExpanded } from "@/components/catalog/ProductCardExpanded";
import { Reveal } from "@/components/motion/Reveal";
import { PaletteGrid } from "@/components/dev/PaletteGrid";
import facts from "../../../_knowledge/facts.json";

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
