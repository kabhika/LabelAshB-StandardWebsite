import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Label AshB",
  description:
    "Shop handcrafted linen dresses, co-ord sets, shirts, tops and silk clothing by Label AshB.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${instrumentSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-labelashb-ground text-labelashb-ink font-labelashb-sans">
        {children}
      </body>
    </html>
  );
}
