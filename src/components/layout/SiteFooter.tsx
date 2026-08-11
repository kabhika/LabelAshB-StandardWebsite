import Link from "next/link";
import facts from "../../../_knowledge/facts.json";

const LINK_CLASS =
  "text-labelashb-small text-labelashb-ink-soft hover:text-labelashb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1";

export function SiteFooter() {
  return (
    <footer className="border-t border-labelashb-border px-6 py-12 sm:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="text-labelashb-body-lg text-labelashb-ink">{facts.brand.name}</p>
          <p className="mt-2 text-labelashb-small text-labelashb-ink-soft">
            {facts.brand.shortDescription}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft">Shop</p>
          <Link href="/products" className={LINK_CLASS}>
            All Products
          </Link>
          <Link href="/about" className={LINK_CLASS}>
            About
          </Link>
          <Link href="/size-guide" className={LINK_CLASS}>
            Size Guide
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft">Policies</p>
          <Link href="/shipping" className={LINK_CLASS}>
            Shipping
          </Link>
          <Link href="/returns" className={LINK_CLASS}>
            Returns
          </Link>
          <Link href="/privacy" className={LINK_CLASS}>
            Privacy
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft">Contact</p>
          <a href={`mailto:${facts.contact.email}`} className={LINK_CLASS}>
            {facts.contact.email}
          </a>
          <p className="text-labelashb-small text-labelashb-ink-soft">{facts.contact.phone}</p>
          <Link href="/contact" className={LINK_CLASS}>
            Contact page
          </Link>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-6xl text-labelashb-small text-labelashb-ink-soft">
        © {new Date().getFullYear()} {facts.brand.name}
      </p>
    </footer>
  );
}
