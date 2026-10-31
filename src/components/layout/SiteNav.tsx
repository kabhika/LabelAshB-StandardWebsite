"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export interface NavLink {
  label: string;
  href: string;
}

const LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Oct 31 2026 redesign: warm-ivory text on the espresso bar, antique-gold
// hover/active accents, 17px labels, generous gaps. The dropdown panel is
// the light ground (same family as the mobile menu) with the fine gold
// hairline border - quiet, no shadows beyond a whisper.
const TRIGGER_CLASS =
  "rounded-none bg-transparent p-0 text-[17px] font-medium tracking-[0.01em] text-labelashb-ground/85 hover:bg-transparent hover:text-labelashb-gold focus-visible:bg-transparent focus-visible:text-labelashb-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-gold focus-visible:ring-offset-[3px] focus-visible:ring-offset-labelashb-espresso data-popup-open:bg-transparent data-open:bg-transparent data-popup-open:text-labelashb-gold data-open:text-labelashb-gold";

const LINK_CLASS =
  "relative rounded-none bg-transparent p-0 text-[17px] font-medium tracking-[0.01em] text-labelashb-ground/85 after:absolute after:inset-x-0 after:-bottom-[3px] after:h-px after:origin-center after:scale-x-0 after:bg-labelashb-gold after:transition-transform after:duration-300 hover:bg-transparent hover:text-labelashb-gold hover:after:scale-x-100 focus-visible:bg-transparent focus-visible:text-labelashb-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-gold focus-visible:ring-offset-[3px] focus-visible:ring-offset-labelashb-espresso data-active:bg-transparent data-active:text-labelashb-gold data-active:after:scale-x-100 data-active:hover:bg-transparent data-active:focus:bg-transparent";

const DROPDOWN_LINK_CLASS =
  "block w-full whitespace-nowrap px-4 py-2.5 text-labelashb-body text-labelashb-ink hover:bg-labelashb-ground-alt hover:text-labelashb-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1";

const PANEL_CLASS =
  "rounded-none border border-labelashb-olive-light/40 bg-labelashb-ground shadow-sm";

// shadcn/BaseUI NavigationMenu instead of plain Links - real hover/focus
// states and an active-page indicator (bottom rule). /products stays
// "active" for any /products/[handle] route too, not just the exact
// listing page.
//
// Categories and Collections are two dropdown triggers ahead of the flat
// links, not merged into one menu - they filter the catalog on two
// different, real axes (garment type vs fabric), and SiteHeader derives
// both lists from the live catalog (never a hardcoded category/material
// that's out of stock). The cart is NOT part of the nav any more - it
// lives in the header bar's right column (CartButton, Oct 31 2026
// redesign).
export function SiteNav({
  categories,
  collections,
}: {
  categories: NavLink[];
  collections: NavLink[];
}) {
  const pathname = usePathname();

  return (
    <NavigationMenu className="max-w-none">
      <NavigationMenuList className="gap-9">
        {categories.length > 0 && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className={TRIGGER_CLASS}>
              Categories
            </NavigationMenuTrigger>
            <NavigationMenuContent className={PANEL_CLASS}>
              <ul className="min-w-44 py-1.5">
                {categories.map(({ href, label }) => (
                  <li key={href}>
                    <NavigationMenuLink
                      render={<Link href={href} className={DROPDOWN_LINK_CLASS} />}
                    >
                      {label}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {collections.length > 0 && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className={TRIGGER_CLASS}>
              Collections
            </NavigationMenuTrigger>
            <NavigationMenuContent className={PANEL_CLASS}>
              <ul className="min-w-44 py-1.5">
                {collections.map(({ href, label }) => (
                  <li key={href}>
                    <NavigationMenuLink
                      render={<Link href={href} className={DROPDOWN_LINK_CLASS} />}
                    >
                      {label}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}

        {LINKS.map(({ href, label }) => {
          // Prefix match keeps a section root active on its sub-pages
          // (/products stays active on /products/[handle], /collection on
          // /collection/[slug]). Safe for these fixed hrefs - none is a
          // bare "/" that would match every route.
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink active={active} render={<Link href={href} className={LINK_CLASS} />}>
                {label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
