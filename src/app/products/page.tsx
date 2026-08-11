import Link from "next/link";
import type { Metadata } from "next";
import { getCatalog } from "@/lib/shopify/catalog";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductFilters, materialLabel } from "@/components/catalog/ProductFilters";
import { JsonLd } from "@/components/shared/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

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

  const catalog = await getCatalog();
  const products = catalog.filter((p) => {
    if (category && p.category !== category) return false;
    if (material && !p.materials.includes(material)) return false;
    return true;
  });

  // Real materials this category actually comes in (not the full KNOWN_MATERIALS
  // list) - used to give the empty state a true, useful alternative rather than
  // a generic "try something else."
  const availableMaterialsForCategory = category
    ? [...new Set(catalog.filter((p) => p.category === category).flatMap((p) => p.materials))]
    : [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
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

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
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
                  ? `${category} doesn't come in ${materialLabel(material)}.`
                  : category
                    ? `No pieces in ${category} right now.`
                    : `No pieces in ${materialLabel(material ?? "")} right now.`}
              </p>

              {category && availableMaterialsForCategory.length > 0 && (
                <div className="mt-6">
                  <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft mb-2">
                    {category} comes in
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
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
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
