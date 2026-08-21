import Link from "next/link";
import Image from "next/image";
import { DISPLAY_CATEGORIES, MATERIAL_GROUPS, getCatalog } from "@/lib/shopify/catalog";
import { SiteNav, type NavLink } from "@/components/layout/SiteNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";

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
    // z-30 (explicit, not left at auto): the labelashb-grain `> *` rule
    // below puts an explicit z-index on its direct child, which makes that
    // child its own stacking context - without a z-index here too, that
    // context gets compared against page content (e.g. the hero section)
    // independently of this header, and MobileNav's dropdown lost that
    // fight (rendered translucent over the hero image). An explicit
    // z-index on header composites this whole subtree as one unit above
    // the page instead.
    <header className="relative z-30 border-b border-labelashb-border">
      {/* Light promo strip - separate band from the nav below, not one
          flat panel: ivory ground + wine text, the same two jewel-tone
          tokens as the homepage system (DESIGN.md), not black/gray. */}
      <AnnouncementBar />

      {/* Dark nav band - "Diagonal jewel sweep", winner of the /style-tile
          nav-band comparison (candidate 1 of 4). Same gradient definition
          verified there, not re-derived: diagonal wine -> ink -> indigo
          blend, not the previous flat left-to-right ink/indigo fade.
          Plus the sitewide labelashb-grain texture so it reads as fabric,
          not flat color - its ::before noise layer paints above this
          background, below real content. No child overlay here (the
          style-tile comparison's other candidates needed one and hit the
          `> *` position bug documented there; this treatment doesn't).
          No overflow-hidden: MobileNav's open dropdown is an
          absolutely-positioned child that must overflow this band
          downward, and this div (position: relative, for the grain
          pseudo-element) is its containing block - clipping it would
          hide the mobile menu. */}
      <div
        className="labelashb-grain relative px-6 py-2 sm:py-4"
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--color-labelashb-wine), var(--color-labelashb-ink), var(--color-labelashb-indigo))",
        }}
      >
        {/* 1fr/auto/1fr keeps the logo mathematically centered regardless
            of what sits in the side columns - MobileNav on mobile,
            nothing on desktop (nav moves to its own row below). */}
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
