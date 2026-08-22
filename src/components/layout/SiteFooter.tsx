import Link from "next/link";
import facts from "../../../_knowledge/facts.json";

const LINK_CLASS =
  "text-labelashb-small text-labelashb-ivory/70 transition-colors hover:text-labelashb-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-labelashb-wine";

const HEADING_CLASS = "text-labelashb-eyebrow uppercase tracking-wide text-labelashb-ivory";

// Original repeating scalloped-arch motif, not sourced from any reference
// site - one arch cell tiled via patternUnits, warm ivory stroke at low
// opacity against the dark wine ground so it reads as texture, not a UI
// element competing with the copyright line above it.
function FooterMotifStrip() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 28"
      preserveAspectRatio="none"
      className="block h-6 w-full text-labelashb-ivory/50 sm:h-7"
    >
      <defs>
        <pattern id="labelashb-footer-scallop" width="32" height="28" patternUnits="userSpaceOnUse">
          <path
            d="M0 6c5 0 6-6 16-6s11 6 16 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <circle cx="16" cy="14" r="1.4" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#labelashb-footer-scallop)" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-labelashb-wine">
      <div className="mx-auto max-w-6xl px-6 py-labelashb-section-standard sm:px-10 lg:px-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 sm:gap-8">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-labelashb-serif text-labelashb-h3 text-labelashb-ivory">
              {facts.brand.name}
            </p>
            <p className="mt-3 text-labelashb-small text-labelashb-ivory/70">
              {facts.brand.shortDescription}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className={HEADING_CLASS}>Shop</p>
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

          <div className="flex flex-col gap-3">
            <p className={HEADING_CLASS}>Policies</p>
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

          <div className="flex flex-col gap-3">
            <p className={HEADING_CLASS}>Contact</p>
            <a href={`mailto:${facts.contact.email}`} className={LINK_CLASS}>
              {facts.contact.email}
            </a>
            <p className="text-labelashb-small text-labelashb-ivory/70">{facts.contact.phone}</p>
            <Link href="/contact" className={LINK_CLASS}>
              Contact page
            </Link>
          </div>
        </div>

        <div className="mt-labelashb-section-compact flex flex-col gap-6 border-t border-labelashb-ivory/20 pt-6">
          <p className="text-labelashb-small text-labelashb-ivory/60">
            © {new Date().getFullYear()} {facts.brand.name}
          </p>
          <FooterMotifStrip />
        </div>
      </div>
    </footer>
  );
}
