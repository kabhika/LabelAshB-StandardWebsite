import Link from "next/link";
import Image from "next/image";
import { CartButton } from "@/components/cart/CartButton";
import { MobileNav } from "@/components/layout/MobileNav";

const NAV_LINK_CLASS =
  "text-labelashb-small text-labelashb-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1";

export function SiteHeader() {
  return (
    <header className="relative border-b border-labelashb-border px-6 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" aria-label="Label AshB, home">
          <Image
            src="/label-ashb-logo-transparent.png"
            alt="Label AshB"
            width={576}
            height={517}
            className="h-11 w-auto"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-6 sm:flex">
          <Link href="/products" className={NAV_LINK_CLASS}>
            Shop
          </Link>
          <Link href="/about" className={NAV_LINK_CLASS}>
            About
          </Link>
          <Link href="/contact" className={NAV_LINK_CLASS}>
            Contact
          </Link>
          <CartButton />
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
