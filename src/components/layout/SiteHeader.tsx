import Link from "next/link";
import Image from "next/image";
import { DISPLAY_CATEGORIES, MATERIAL_GROUPS, getCatalog } from "@/lib/shopify/catalog";
import { SiteNav, type NavLink } from "@/components/layout/SiteNav";
import { MobileNav } from "@/components/layout/MobileNav";

// Same derive-from-live-catalog pattern as TabbedProductCarousel (categories)
// and the homepage's fabric showcase (materials) - never a hardcoded
// category/collection that isn't actually in stock right now.
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

export async function SiteHeader() {
  const { categories, collections } = await getNavLinks();

  return (
    <header className="relative border-b border-labelashb-border">
      <div className="bg-labelashb-ink px-4 py-1 text-center text-[0.6875rem] text-labelashb-ground sm:py-1.5 sm:text-labelashb-small">
        {/* Abbreviated on mobile - the full sentence wraps to 2 lines at
            375px and eats into the hero's tight below-the-fold budget
            (verified: pushed the CTA past the iPhone SE 667px floor). */}
        <span className="sm:hidden">Ready-to-ship: 3-5 days · Made-to-order: 2-3 weeks</span>
        <span className="hidden sm:inline">
          Ready-to-ship: 3-5 business days. Made-to-order/customized: 2-3 weeks.
        </span>
      </div>

      <div className="px-6 py-2 sm:py-4">
        {/* 1fr/auto/1fr keeps the logo mathematically centered regardless
            of what sits in the side columns - MobileNav on mobile,
            nothing on desktop (nav moves to its own row below). */}
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center">
          <div />
          <Link
            href="/"
            aria-label="Label AshB, home"
            className="inline-block justify-self-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
          >
            <Image
              src="/label-ashb-logo-transparent.png"
              alt="Label AshB"
              width={576}
              height={517}
              className="h-12 w-auto sm:h-24"
              priority
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
    </header>
  );
}
