import Link from "next/link";
import Image from "next/image";
import { SiteNav } from "@/components/layout/SiteNav";
import { MobileNav } from "@/components/layout/MobileNav";

export function SiteHeader() {
  return (
    <header className="relative border-b border-labelashb-border">
      <div className="bg-labelashb-ink px-4 py-1 text-center text-[0.6875rem] text-labelashb-ground sm:py-1.5 sm:text-labelashb-small">
        {/* Abbreviated on mobile - the full sentence wraps to 2 lines at
            375px and eats into the hero's tight below-the-fold budget
            (verified: pushed the CTA past the iPhone SE 667px floor). */}
        <span className="sm:hidden">Ready-to-ship: 3-5 days · Made-to-order: 2-3 weeks</span>
        <span className="hidden sm:inline">
          Ready-to-ship: 3-5 business days. Made-to-order/customized: 2-3 weeks.
        </span>
      </div>

      <div className="px-6 py-2 sm:py-4">
        {/* 1fr/auto/1fr keeps the logo mathematically centered regardless
            of what sits in the side columns - MobileNav on mobile,
            nothing on desktop (nav moves to its own row below). */}
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center">
          <div />
          <Link
            href="/"
            aria-label="Label AshB, home"
            className="inline-block justify-self-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
          >
            <Image
              src="/label-ashb-logo-transparent.png"
              alt="Label AshB"
              width={576}
              height={517}
              className="h-12 w-auto sm:h-24"
              priority
            />
          </Link>
          <div className="justify-self-end">
            <MobileNav />
          </div>
        </div>

        <div className="mt-3 hidden justify-center sm:flex">
          <SiteNav />
        </div>
      </div>
    </header>
  );
}
