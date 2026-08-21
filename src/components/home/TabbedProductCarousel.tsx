"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DISPLAY_CATEGORIES, type NormalizedProduct } from "@/lib/shopify/catalog";
import { ProductCardExpanded } from "@/components/catalog/ProductCardExpanded";

// Same critically-damped pill spring as ProductCardSizePicker.tsx / SizeSelector.tsx
// (damping 1.0, response 0.3s -> bounce 0 / duration 0.3) - one spring feel
// sitewide for "this thing slid to where you clicked" motion.
const UNDERLINE_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

// Arrows scroll by ~85% of the visible track, not one card - reads as "show
// me more" rather than a slow single-card crawl, while still leaving enough
// overlap with the previous view that nothing gets skipped unseen.
const SCROLL_STEP_RATIO = 0.85;

// Below this count a post-exclusion row reads as sparse rather than
// curated, so fall back to the unfiltered category list instead of a
// too-short row (see excludeIds below).
const MIN_ROW_AFTER_EXCLUDE = 2;

export function TabbedProductCarousel({
  products,
  excludeIds,
}: {
  products: NormalizedProduct[];
  // Product ids already shown elsewhere on the page (e.g. "New in") -
  // dropped from each category's initial selection so the two sections
  // don't open on the same pieces. Falls back to including them per
  // category when exclusion would leave too few/none.
  excludeIds?: Set<string>;
}) {
  const groupId = useId();
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Tabs only for categories actually present among in-stock products, in
  // the catalog's own DISPLAY_CATEGORIES order - never a hardcoded 4th tab
  // for a category that doesn't exist (see PLACEHOLDER-POLICY.md).
  const categories = useMemo(() => {
    const present = new Set(
      products.filter((p) => p.inStock).map((p) => p.category),
    );
    return DISPLAY_CATEGORIES.filter((category) => present.has(category));
  }, [products]);

  const [active, setActive] = useState(categories[0] ?? "");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const visible = useMemo(() => {
    const inCategory = products.filter((p) => p.inStock && p.category === active);
    if (!excludeIds || excludeIds.size === 0) return inCategory;

    const deduped = inCategory.filter((p) => !excludeIds.has(p.id));
    return deduped.length >= MIN_ROW_AFTER_EXCLUDE ? deduped : inCategory;
  }, [products, active, excludeIds]);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  // Re-measure on every tab switch too: a shorter category (fewer products)
  // can go from "overflowing, right arrow live" to "fits fully, both dead"
  // without the track itself ever firing a scroll event.
  useEffect(() => {
    updateScrollState();
  }, [visible, updateScrollState]);

  function scrollByStep(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * SCROLL_STEP_RATIO,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  // Roving-tabindex arrow-key nav per the WAI-ARIA APG Tabs pattern: Left/
  // Right move and activate (these are lightweight category switches, not
  // async panels, so automatic activation is the right call), Home/End jump
  // to the ends. Only the active tab is in the natural Tab order - matches
  // what aria-selected already communicates to a screen reader.
  function handleTabKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % categories.length;
    else if (e.key === "ArrowLeft") nextIndex = (index - 1 + categories.length) % categories.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = categories.length - 1;

    if (nextIndex === null) return;
    e.preventDefault();
    setActive(categories[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  }

  if (categories.length === 0) return null;

  return (
    <div>
      <div className="flex items-end justify-between gap-4 border-b border-labelashb-border">
        <div role="tablist" aria-label="Product category" className="flex gap-8 overflow-x-auto overflow-y-hidden">
          {categories.map((category, index) => {
            const isActive = category === active;
            return (
              <button
                key={category}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(category)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                className={`relative whitespace-nowrap pt-1 pb-4 text-labelashb-body-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-indigo focus-visible:ring-offset-1 ${
                  isActive
                    ? "text-labelashb-ink"
                    : "text-labelashb-ink-soft hover:text-labelashb-ink"
                }`}
              >
                {category}
                {isActive && (
                  <motion.span
                    layoutId={`${groupId}-tab-underline`}
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-labelashb-indigo"
                    transition={reduceMotion ? { duration: 0 } : UNDERLINE_SPRING}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mb-3 hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            aria-label="Scroll to previous products"
            disabled={!canScrollLeft}
            onClick={() => scrollByStep(-1)}
            className="flex w-labelashb-carousel-control h-labelashb-carousel-control items-center justify-center rounded-full border border-labelashb-border text-labelashb-ink transition-colors hover:border-labelashb-indigo hover:text-labelashb-indigo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-indigo focus-visible:ring-offset-1 disabled:opacity-30 disabled:hover:border-labelashb-border disabled:hover:text-labelashb-ink disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Scroll to next products"
            disabled={!canScrollRight}
            onClick={() => scrollByStep(1)}
            className="flex w-labelashb-carousel-control h-labelashb-carousel-control items-center justify-center rounded-full border border-labelashb-border text-labelashb-ink transition-colors hover:border-labelashb-indigo hover:text-labelashb-indigo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-indigo focus-visible:ring-offset-1 disabled:opacity-30 disabled:hover:border-labelashb-border disabled:hover:text-labelashb-ink disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={updateScrollState}
        className="mt-labelashb-section-compact flex snap-x snap-mandatory gap-labelashb-carousel-gap overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {visible.map((product) => (
          <div
            key={product.id}
            // xl+ (>=1280px): container settles at max-w-6xl (1152px, see
            // page.tsx's px-16 section padding), so card width is solved
            // against that real 100% rather than a guessed static value -
            // (100% - 3 gaps) / 4 seats exactly 4 cards with zero clipping,
            // no partial-next-card peek. Below xl the row is intentionally
            // narrower than 4 cards - snap-scroll (see track below) is how
            // you reach the rest, same as when a category has >4 products.
            className="w-64 flex-none snap-start sm:w-72 xl:w-[calc((100%-3*var(--spacing-labelashb-carousel-gap))/4)]"
          >
            <ProductCardExpanded product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
