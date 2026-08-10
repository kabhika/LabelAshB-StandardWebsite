import Link from "next/link";
import { CartButton } from "@/components/cart/CartButton";

export function SiteHeader() {
  return (
    <header className="border-b border-labelashb-border px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-labelashb-body-lg text-labelashb-ink">
          Label AshB
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
