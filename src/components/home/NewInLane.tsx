"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NormalizedProduct } from "@/lib/shopify/catalog";
import { ProductCardExpanded } from "@/components/catalog/ProductCardExpanded";

// The "New in the atelier" lane (Oct 31 refinement pass). Below md this
// is an intentional ONE-CARD carousel: each slide is the full container
// width and snap-centred, so a single complete, readable card shows at a
// time - no narrow slice of the next card with clipped titles/prices
// (the old w-64 scroll row did exactly that). Clear prev/next arrows
// overlay the photo (they double as the swipe cue), native touch swipe
// still works, and the arrows give keyboard users the same navigation.
// md+ is the shared-shell grid from the layout pass (2-up, 4-up from xl)
// - arrows and scrolling disappear.
export function NewInLane({ products }: { products: NormalizedProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [updateScrollState]);

  function scrollByCard(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    // One slide per step; ~92% so the snap lands cleanly on the next
    // card even with a sliver of sub-pixel rounding.
    el.scrollBy({ left: direction * el.clientWidth * 0.92, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={updateScrollState}
        className="flex snap-x snap-mandatory gap-0 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:gap-labelashb-carousel-gap md:overflow-visible md:pb-0 md:[scrollbar-width:auto] md:[&::-webkit-scrollbar]:block xl:grid-cols-4"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-full flex-none snap-center md:w-auto"
          >
            <ProductCardExpanded product={product} />
          </div>
        ))}
      </div>

      {/* Mobile-only arrows, overlaid at photo mid-height. Opaque enough
          to read on any photo, labelled for screen readers, 44px hit
          area. Disabled state fades them out of the way. */}
      <div aria-hidden={false} className="md:hidden">
        <button
          type="button"
          aria-label="Previous product"
          disabled={!canScrollLeft}
          onClick={() => scrollByCard(-1)}
          className={`absolute top-[34%] left-1 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-labelashb-ink/20 bg-labelashb-ground/90 text-labelashb-ink shadow-sm backdrop-blur-sm transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent ${
            canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Next product"
          disabled={!canScrollRight}
          onClick={() => scrollByCard(1)}
          className={`absolute top-[34%] right-1 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-labelashb-ink/20 bg-labelashb-ground/90 text-labelashb-ink shadow-sm backdrop-blur-sm transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent ${
            canScrollRight ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
