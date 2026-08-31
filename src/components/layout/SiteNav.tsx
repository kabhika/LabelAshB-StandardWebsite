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
import { CartButton } from "@/components/cart/CartButton";

export interface NavLink {
  label: string;
  href: string;
}

const LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const DROPDOWN_LINK_CLASS =
  "block w-full whitespace-nowrap px-3 py-2 text-labelashb-body text-labelashb-ink hover:bg-labelashb-ground-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1";

// shadcn/BaseUI NavigationMenu instead of plain Links - real hover/focus
// states and an active-page indicator (bottom rule), which the old flat
// links never had. /products stays "active" for any /products/[handle]
// route too, not just the exact listing page.
//
// Categories and Collections are two dropdown triggers ahead of the flat
// links, not merged into one menu - they filter the catalog on two
// different, real axes (garment type vs fabric), and SiteHeader derives
// both lists from the live catalog (never a hardcoded category/material
// that's out of stock).
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
      <NavigationMenuList className="gap-6">
        {categories.length > 0 && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className="rounded-none bg-transparent p-0 text-labelashb-body font-semibold text-labelashb-ground/70 hover:bg-transparent hover:text-labelashb-ground focus-visible:ring-2 focus-visible:ring-labelashb-ground focus-visible:ring-offset-1 data-popup-open:bg-transparent data-open:bg-transparent">
              Categories
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="min-w-40 py-1">
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
            <NavigationMenuTrigger className="rounded-none bg-transparent p-0 text-labelashb-body font-semibold text-labelashb-ground/70 hover:bg-transparent hover:text-labelashb-ground focus-visible:ring-2 focus-visible:ring-labelashb-ground focus-visible:ring-offset-1 data-popup-open:bg-transparent data-open:bg-transparent">
              Collections
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="min-w-40 py-1">
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
              <NavigationMenuLink
                active={active}
                render={
                  <Link
                    href={href}
                    className="relative rounded-none bg-transparent p-0 text-labelashb-body font-semibold text-labelashb-ground/70 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-labelashb-ground after:transition-transform after:duration-300 hover:bg-transparent hover:text-labelashb-ground focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-labelashb-ground focus-visible:ring-offset-1 focus-visible:outline-none data-active:bg-transparent data-active:text-labelashb-ground data-active:after:scale-x-100 data-active:hover:bg-transparent data-active:focus:bg-transparent"
                  />
                }
              >
                {label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
        <li>
          <CartButton />
        </li>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
