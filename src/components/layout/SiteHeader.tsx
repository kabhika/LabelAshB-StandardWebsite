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

      {/* Dark nav band - deepens from ink toward indigo at the trailing
          edge (jewel-tone family, not a new hue) plus the sitewide
          labelashb-grain texture so it reads as fabric, not flat color.
          No overflow-hidden here: MobileNav's open dropdown is an
          absolutely-positioned child that must overflow this band
          downward, and this div (position: relative, for the grain
          pseudo-element and radial highlight below) is its containing
          block - clipping it would hide the mobile menu. The radial
          highlight itself needs no clipping anyway, it's sized inset-x-0
          h-full to the band already. */}
      <div className="labelashb-grain relative bg-gradient-to-r from-labelashb-ink via-labelashb-ink to-labelashb-indigo px-6 py-2 sm:py-4">
        {/* Warm one-off highlight near the logo, echoing its gold tone -
            not a new design-system color token, just a local decorative
            radial scoped to this band. labelashb-grain's own `> *` rule
            already lifts this above the noise overlay (z-index: 1). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full"
          style={{
            background:
              "radial-gradient(circle at 50% 38%, rgba(201,162,90,0.16), transparent 60%)",
          }}
        />

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
