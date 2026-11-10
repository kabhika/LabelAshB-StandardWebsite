import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog, MATERIAL_GROUPS } from "@/lib/shopify/catalog";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductFilters, materialLabel } from "@/components/catalog/ProductFilters";
import { JsonLd } from "@/components/shared/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

// A comma-joined material value (the header's Collections dropdown, e.g.
// "Silk" = crepe-silk,chanderi-silk,modal-silk) reads as one group name in
// copy, not a raw slug list - falls back to the plain single-slug label
// when the value isn't an exact group match (or has none).
function materialDisplayLabel(material: string): string {
  const slugs = material.split(",");
  if (slugs.length > 1) {
    const group = MATERIAL_GROUPS.find(
      (g) => g.slugs.length === slugs.length && g.slugs.every((s) => slugs.includes(s)),
    );
    if (group) return group.label;
  }
  return materialLabel(material);
}

export const metadata: Metadata = {
  title: "Shop All",
  description:
    "Browse the full Label AshB collection of linen, silk and cotton dresses, tops and co-ord sets, filterable by category and fabric.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const material = typeof params.material === "string" ? params.material : undefined;
  // Comma-separated is the header's Collections dropdown asking for a
  // fabric group (e.g. "Silk" = crepe-silk,chanderi-silk,modal-silk) - the
  // single-slug case (the sidebar's own material chips) still works
  // identically since split(",") on a value with no comma is a 1-item array.
  const materialSlugs = material?.split(",");

  const catalog = await getCatalog();
  // Case-insensitive filter matching: the URL is public ad traffic input, and
  // a hand-typed ?category=dresses (wrong case) previously rendered an empty
  // listing instead of the dresses grid — paid clicks must never hit that.
  const products = catalog.filter((p) => {
    if (category && p.category.toLowerCase() !== category.toLowerCase()) return false;
    if (
      materialSlugs &&
      !materialSlugs.some((m) =>
        p.materials.some((pm) => pm.toLowerCase() === m.toLowerCase()),
      )
    ) {
      return false;
    }
    return true;
  });

  // Real materials this category actually comes in (not the full KNOWN_MATERIALS
  // list) - used to give the empty state a true, useful alternative rather than
  // a generic "try something else."
  const availableMaterialsForCategory = category
    ? [...new Set(catalog.filter((p) => p.category === category).flatMap((p) => p.materials))]
    : [];

  // Uncapped, near-full-bleed (client: "leave only a little space
  // between the side and the image", Oct 29 2026 evening): product
  // photography spans side-to-side with a small side gap only.
  return (
    <main className="w-full px-6 py-16 sm:px-8 lg:px-10">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop All", path: "/products" },
        ])}
      />
      <h1 className="text-labelashb-h1 text-labelashb-ink">Shop All</h1>
      <p className="mt-2 text-labelashb-body text-labelashb-ink-soft">
        {products.length} {products.length === 1 ? "piece" : "pieces"}
        {category ? ` in ${category}` : ""}
      </p>
      {/* Two lead-time tiers, mirroring the PDP buy-box and ServiceAssurance
          Band ("normal ships 3-4 days, customized 10-12 days" - client
          confirmed Oct 30 2026). Ad traffic lands on this filtered view,
          never the homepage, so the promise must live here too - but a
          single "10-12 days" line would undersell ready-to-ship pieces and
          contradict the product page one click later. */}
      <p className="mt-1 text-labelashb-small text-labelashb-ink-soft">
        Made to order: 10–12 days · Ready-to-ship styles: 3–4 days
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside>
          <ProductFilters activeCategory={category} activeMaterial={material} />
        </aside>

        <div>
          {/* Product titles below render as h3 (ProductCard) - this closes
              the h1->h3 gap so the heading outline doesn't skip a level. */}
          <h2 className="sr-only">
            {category ? `${category} products` : "All products"}
          </h2>
          {products.length === 0 ? (
            <div className="max-w-md py-8">
              <p className="text-labelashb-body-lg text-labelashb-ink">
                {category && material
                  ? `${category} have no pieces in ${materialDisplayLabel(material)}.`
                  : category
                    ? `No pieces in ${category} right now.`
                    : `No pieces in ${materialDisplayLabel(material ?? "")} right now.`}
              </p>

              {category && availableMaterialsForCategory.length > 0 && (
                <div className="mt-6">
                  <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft mb-2">
                    Available materials
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableMaterialsForCategory.map((m) => (
                      <Link
                        key={m}
                        href={`/products?category=${encodeURIComponent(category)}&material=${encodeURIComponent(m)}`}
                        className="inline-flex min-h-11 items-center border border-labelashb-border px-3 text-labelashb-eyebrow uppercase text-labelashb-ink-soft hover:border-labelashb-ink hover:bg-labelashb-ground-alt hover:text-labelashb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
                      >
                        {materialLabel(m)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href="/products"
                className="mt-6 inline-block text-labelashb-small text-labelashb-accent underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            // Shree-style tight gutters (12px x, 32px y for the caption
            // lines); 5-up from 2xl, 6-up from 1920px so tiles stay
            // ~260-300px, not poster-size.
            <div className="grid grid-cols-1 gap-x-3 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
