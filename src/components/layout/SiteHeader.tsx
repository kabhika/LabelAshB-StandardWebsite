import Link from "next/link";
import Image from "next/image";
import { CartButton } from "@/components/cart/CartButton";

export function SiteHeader() {
  return (
    <header className="border-b border-labelashb-border px-6 py-3">
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
        <nav className="flex items-center gap-6">
          <Link href="/products" className="text-labelashb-small text-labelashb-ink-soft">
            Shop
          </Link>
          <Link href="/about" className="text-labelashb-small text-labelashb-ink-soft">
            About
          </Link>
          <Link href="/contact" className="text-labelashb-small text-labelashb-ink-soft">
            Contact
          </Link>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}
