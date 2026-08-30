import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  collectionGarments,
  collectionCategories,
  type CollectionCategory,
} from "@/data/new-collection";
import { JsonLd } from "@/components/shared/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "The New Collection",
  description:
    "Eighteen new Label AshB pieces - dresses, shirts, tunics and co-ord sets - photographed across five views each. Pricing and sizing on request.",
  alternates: { canonical: "/collection" },
};

// Chip style matches the shop filters (ProductFilters / products page
// empty-state chips): bordered, uppercase eyebrow, min-h-11 tap target.
const CHIP_CLASS =
  "inline-flex min-h-11 items-center border px-3 text-labelashb-eyebrow uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1";

export default async function CollectionPage({
  searchParams,
}: PageProps<"/collection">) {
  const params = await searchParams;
  const raw = typeof params.category === "string" ? params.category : undefined;
  const category = collectionCategories.includes(raw as CollectionCategory)
    ? (raw as CollectionCategory)
    : undefined;

  const garments = category
    ? collectionGarments.filter((g) => g.category === category)
    : collectionGarments;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "The New Collection", path: "/collection" },
        ])}
      />
      <h1 className="text-labelashb-h1 text-labelashb-ink">The New Collection</h1>
      <p className="mt-2 max-w-2xl text-labelashb-body text-labelashb-ink-soft">
        Eighteen new pieces - dresses, shirts, tunics and co-ord sets - each
        photographed across five views. Pricing and sizing on request.
      </p>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <Link
          href="/collection"
          className={`${CHIP_CLASS} ${
            category
              ? "border-labelashb-border text-labelashb-ink-soft hover:border-labelashb-ink hover:bg-labelashb-ground-alt hover:text-labelashb-ink"
              : "border-labelashb-ink bg-labelashb-ground-alt text-labelashb-ink"
          }`}
          aria-current={!category}
        >
          All
        </Link>
        {collectionCategories.map((c) => {
          const active = category === c;
          return (
            <Link
              key={c}
              href={`/collection?category=${encodeURIComponent(c)}`}
              className={`${CHIP_CLASS} ${
                active
                  ? "border-labelashb-ink bg-labelashb-ground-alt text-labelashb-ink"
                  : "border-labelashb-border text-labelashb-ink-soft hover:border-labelashb-ink hover:bg-labelashb-ground-alt hover:text-labelashb-ink"
              }`}
              aria-current={active}
            >
              {c}
            </Link>
          );
        })}
      </div>

      {/* Garment names below render as h3 (card headings) - closes the
          h1->h3 outline gap the same way the shop grid does. */}
      <h2 className="sr-only">{category ? `${category} in the new collection` : "All pieces in the new collection"}</h2>
      <p className="mt-6 text-labelashb-body text-labelashb-ink-soft">
        {garments.length} {garments.length === 1 ? "piece" : "pieces"}
        {category ? ` in ${category}` : ""}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {garments.map((g) => (
          <Link
            key={g.slug}
            href={`/collection/${g.slug}`}
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-4"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-labelashb-ground-alt">
              <Image
                src={g.views.front}
                alt={`${g.name} - ${g.shortDescription}`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-opacity duration-500 group-hover:opacity-0"
              />
              <Image
                src={g.views.threeQuarter}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden
              />
            </div>
            <p className="mt-3 text-labelashb-eyebrow uppercase text-labelashb-ink-soft">
              {g.category}
            </p>
            <h3 className="mt-1 text-labelashb-body-lg text-labelashb-ink group-hover:text-labelashb-accent">
              {g.name}
            </h3>
            <p className="mt-1 text-labelashb-body text-labelashb-ink-soft">
              {g.shortDescription}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
