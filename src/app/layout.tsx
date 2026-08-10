import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SITE_URL } from "@/lib/site";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${instrumentSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-labelashb-ground text-labelashb-ink font-labelashb-sans">
        <CartProvider>
          <SiteHeader />
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
