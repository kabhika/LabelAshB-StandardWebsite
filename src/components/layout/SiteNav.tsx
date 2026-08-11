"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { CartButton } from "@/components/cart/CartButton";

const LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// shadcn/BaseUI NavigationMenu instead of plain Links - real hover/focus
// states and an active-page indicator (bottom rule), which the old flat
// links never had. /products stays "active" for any /products/[handle]
// route too, not just the exact listing page.
export function SiteNav() {
  const pathname = usePathname();

  return (
    <NavigationMenu className="max-w-none">
      <NavigationMenuList className="gap-6">
        {LINKS.map(({ href, label }) => {
          const active =
            href === "/products"
              ? pathname === href || pathname.startsWith("/products/")
              : pathname === href;
          return (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink
                active={active}
                render={
                  <Link
                    href={href}
                    className="relative rounded-none bg-transparent p-0 text-labelashb-body font-semibold text-labelashb-ink-soft after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-labelashb-accent after:transition-transform after:duration-300 hover:bg-transparent hover:text-labelashb-ink focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1 focus-visible:outline-none data-active:bg-transparent data-active:text-labelashb-ink data-active:after:scale-x-100 data-active:hover:bg-transparent data-active:focus:bg-transparent"
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
