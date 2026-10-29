"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, type PanInfo } from "motion/react";

export interface HeroSlide {
  url: string;
  alt: string;
}

const ROTATE_MS = 5000;
const SWIPE_THRESHOLD = 60;

// Two-panel hero (client rules, Oct 17 2026): the FRONT photo sits left,
// the BACK photo of the same garment sits right, and NEITHER may crop.
// Every hero source is pre-trimmed to exactly 2:3 (empty studio backdrop
// only - never the model), so the fixed aspect-[2/3] frames show each
// photo whole and object-cover is a no-op safety, not a cropper. A third
// close-up slot may be added later; until then, always front + back.
//
// Fit guarantee: at >=1300px both frames cap their height at 74cqw of
// the hero images column (container-type: size on the wrapper), so the
// pair's width can never exceed the column and overflow-hidden can never
// clip a photo - regardless of window proportions. The companion only
// renders from 1300px up; below that the hero is copy + primary, which
// holds its perfect 2:3 at every width.
//
// Both panels live here (not two carousels) so one rotation clock keeps
// them frame-synced forever - separate intervals would drift. All slides
// render simultaneously (position: absolute, crossfaded by opacity)
// instead of mounting/unmounting on index change, so the browser can
// fetch upcoming slides ahead of their turn. Only slide 0 gets Next's
// `priority` (LCP hint); the rest use the framework default (lazy).
export function HeroCarousel({
  slides,
  details,
}: {
  slides: HeroSlide[];
  details?: HeroSlide[];
}) {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const count = slides.length;
  const detailCount = details?.length ?? 0;

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % count);
    }, ROTATE_MS);
    return () => clearInterval(id);
    // Re-arming on `index` too means manual navigation (dot click, swipe)
    // gets a full ROTATE_MS before the next auto-advance, instead of
    // sometimes firing again almost immediately after.
  }, [count, index]);

  if (count === 0) return null;

  const goTo = (next: number) => setIndex(((next % count) + count) % count);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) goTo(index + 1);
    else if (info.offset.x > SWIPE_THRESHOLD) goTo(index - 1);
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden [container-type:size]"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={() => (pausedRef.current = true)}
      onTouchEnd={() => (pausedRef.current = false)}
    >
      <motion.div
        className="flex h-full w-full cursor-grab touch-pan-y items-center gap-[2px] active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        {/* Primary frame - the garment's FRONT view, left of the pair.
            Fixed 2:3 so the photo (pre-trimmed to the same ratio) never
            crops. Height is the column height, capped at 74cqw once the
            companion joins at 1300px so the two frames always fit. */}
        <div className="relative aspect-[2/3] h-full shrink-0 min-[1300px]:h-[min(100%,74cqw)]">
          {slides.map((slide, i) => (
            <div
              key={slide.url}
              className="absolute inset-0 bg-labelashb-ground-alt transition-opacity duration-1000 ease-in-out"
              style={{ opacity: i === index ? 1 : 0 }}
              aria-hidden={i !== index}
            >
              <Image
                src={slide.url}
                alt={slide.alt}
                fill
                // Below md the primary is the only panel; it is centered
                // at ~62vw wide (46svh tall at 2:3), so 62vw keeps the
                // optimizer from fetching a full-viewport-width file.
                sizes="(min-width: 768px) 47vh, 62vw"
                // Eager for the same mid-fade-pop reason as the
                // companion panel below.
                loading="eager"
                priority={i === 0}
                className="pointer-events-none object-cover"
              />
            </div>
          ))}

          {count > 1 && (
            <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.url}
                  type="button"
                  aria-label={`Show slide ${i + 1} of ${count}`}
                  aria-current={i === index}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-ground focus-visible:ring-offset-1 ${
                    i === index
                      ? "w-6 bg-labelashb-ground"
                      : "w-1.5 bg-labelashb-ground/50 hover:bg-labelashb-ground/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Companion panel - the SAME garment's BACK view, right of the
            pair (client rule, Oct 17 2026). Also fixed 2:3 so the photo
            shows whole; same 74cqw height cap so the pair never exceeds
            the column. Hidden below 1300px - there the hero is copy +
            primary only. */}
        {details && detailCount === count && (
          <div className="relative hidden aspect-[2/3] h-full shrink-0 min-[1300px]:block min-[1300px]:h-[min(100%,74cqw)]">
            {details.map((slide, i) => (
              <div
                key={slide.url}
                className="absolute inset-0 bg-labelashb-ground-alt transition-opacity duration-1000 ease-in-out"
                style={{ opacity: i === index ? 1 : 0 }}
                aria-hidden={i !== index}
              >
                <Image
                  src={slide.url}
                  alt={slide.alt}
                  fill
                  sizes="(min-width: 1300px) 45vw, 100vw"
                  loading="eager"
                  priority={i === 0}
                  className="pointer-events-none object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
