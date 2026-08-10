import type { Metadata } from "next";
import { getCatalog } from "@/lib/shopify/catalog";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductFilters } from "@/components/catalog/ProductFilters";
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

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <p className="text-labelashb-body text-labelashb-ink-soft">
              No pieces match this filter right now.
            </p>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
