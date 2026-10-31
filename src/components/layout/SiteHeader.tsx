import Link from "next/link";
import Image from "next/image";
import { DISPLAY_CATEGORIES, MATERIAL_GROUPS, getCatalog } from "@/lib/shopify/catalog";
import { SiteNav, type NavLink } from "@/components/layout/SiteNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { CartButton } from "@/components/cart/CartButton";
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

// Logo artwork is near-square (528x469 after the transparent-margin trim
// into label-ashb-logo.png), so the size that reads as a fashion-brand
// mark AND fits the 112px bar is height-driven: 84px tall (~94px wide).
// width/height attrs match the file exactly, so next/image reserves the
// right box and nothing shifts while it loads.
const LOGO = {
  desktop: { h: 84, w: Math.round((84 * 528) / 469) },
  mobile: { h: 44, w: Math.round((44 * 528) / 469) },
};

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
    <header className="relative z-30">
      <AnnouncementBar />

      {/* Single horizontal bar (Oct 31 2026 redesign): solid espresso, no
          fabric texture - logo left, navigation centre, bag right on
          desktop; below lg (1024px) the desktop nav gets crowded, so it
          collapses to menu button / centred logo / bag. One grid both
          ways: [auto 1fr auto], the middle column keeps the logo
          mathematically centred on mobile and the nav centred on desktop.

          position: relative is MobileNav's dropdown's containing block -
          no overflow-hidden here, the open menu must overflow downward.
          Fine gold hairline at the bottom of the bar (not oversized):
          border-labelashb-olive-light/40. */}
      <div className="relative border-b border-labelashb-olive-light/40 bg-labelashb-espresso">
        <div className="mx-auto grid h-[72px] max-w-[88rem] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:h-[112px] lg:px-8">
          {/* Left column: menu button below lg, logo at lg+. */}
          <div className="flex items-center justify-self-start lg:hidden">
            <MobileNav categories={categories} collections={collections} />
          </div>
          <Link
            href="/"
            aria-label="Label AshB, home"
            className="hidden justify-self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-gold focus-visible:ring-offset-2 focus-visible:ring-offset-labelashb-espresso lg:inline-block"
          >
            <Image
              src="/label-ashb-logo.png"
              alt="Label AshB"
              width={LOGO.desktop.w}
              height={LOGO.desktop.h}
              priority
              className="h-[84px] w-auto"
            />
          </Link>

          {/* Centre column: logo below lg, navigation at lg+. */}
          <Link
            href="/"
            aria-label="Label AshB, home"
            className="justify-self-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-gold focus-visible:ring-offset-2 focus-visible:ring-offset-labelashb-espresso lg:hidden"
          >
            <Image
              src="/label-ashb-logo.png"
              alt="Label AshB"
              width={LOGO.mobile.w}
              height={LOGO.mobile.h}
              priority
              className="h-11 w-auto"
            />
          </Link>
          <nav aria-label="Main" className="hidden justify-self-center lg:block">
            <SiteNav categories={categories} collections={collections} />
          </nav>

          {/* Right column: the bag, same on every width. */}
          <div className="flex items-center justify-self-end">
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}
