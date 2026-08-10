import Link from "next/link";
import { getCatalog } from "@/lib/shopify/catalog";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import facts from "../../_knowledge/facts.json";

export default async function Home() {
  const catalog = await getCatalog();
  const featured = catalog.filter((p) => p.inStock).slice(0, 6);

  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-labelashb-border px-6 py-24 sm:py-32">
        <Reveal>
          <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft mb-4">
            Handcrafted in India
          </p>
          <h1 className="text-labelashb-display text-labelashb-ink max-w-3xl">
            {facts.brand.name}
          </h1>
          <p className="mt-6 max-w-xl text-labelashb-body-lg text-labelashb-ink-soft">
            {facts.brand.shortDescription}
          </p>
          <div className="mt-8">
            <Link href="/products">
              <Button variant="primary">Shop the collection</Button>
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-labelashb-h2 text-labelashb-ink">Featured</h2>
            <Link
              href="/products"
              className="text-labelashb-small text-labelashb-accent underline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
