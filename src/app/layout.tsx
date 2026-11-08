import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SITE_URL } from "@/lib/site";
import facts from "../../_knowledge/facts.json";

// Google Ads conversion tracking. All-or-nothing: with either variable
// unset (the pre-campaign default) the gtag scripts stay out of the page
// entirely - a half-configured deploy must never load the tag sitewide
// while conversions silently fail to fire.
const GOOGLE_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;
const GOOGLE_ADS_PURCHASE_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL;

// Quiet Luxury pairing (direction B, Oct 2026): Jost for UI/body sitewide,
// Cormorant Garamond as the display serif. Both variables are set on <html>
// here so the serif resolves outside the homepage too (footer brand line,
// About headings) - the old Fraunces hookup was scoped to the homepage
// <main> and silently fell back to Georgia everywhere else.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // "default" is used as-is for routes that set no title of their own
  // (the home page) - it does NOT run through "template". Routes that set
  // title: "X" get "X | Label AshB" via the template. Never set the home
  // page's title to "Label AshB" explicitly, or it doubles to
  // "Label AshB | Label AshB".
  title: {
    default: "Label AshB",
    template: "%s | Label AshB",
  },
  description:
    "Shop handcrafted linen dresses, co-ord sets, shirts, tops and silk clothing by Label AshB.",
  alternates: {
    canonical: "/",
  },
};

// viewportFit: "cover" lets content draw under the notch/home-indicator
// safe areas on modern phones - without it, env(safe-area-inset-*) always
// resolves to 0, which is what left the homepage's WhatsAppFloat button
// unaware of the home-indicator area on notched devices.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jost.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-labelashb-ground text-labelashb-ink font-labelashb-sans">
        <CartProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <CartDrawer />
          {/* ExitIntentPopup REMOVED Oct 31 refinement pass (client:
              "replace the automatically appearing discount popup with a
              discreet offer within the newsletter section") - the LABLOVE
              offer now lives in NewsletterSignup. Component file deleted. */}
        </CartProvider>
        {/* Google tag (Google Ads conversion tracking; a future GA4 G- id
            can use the same var). Inlined at build time, so it must not be
            set per-request. Unset = no script at all, which is why the
            site stayed script-free until the campaign was ready. */}
        {GOOGLE_TAG_ID && GOOGLE_ADS_PURCHASE_LABEL && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-tag-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_TAG_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
