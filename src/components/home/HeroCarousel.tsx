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

// Two-panel hero: the PRIMARY photo sits left, its companion (same
// garment's second pose, or the paired single - see HERO_SET in
// new-collection.ts) sits right. Oct 30 2026: frames are 4:5 - the new
// hero set (public/hero/) is pre-cropped to exactly 4:5 by
// .match/prep-new-hero.mjs with subject-centered windows, so object-cover
// is a no-op safety, not a cropper.
//
// Fit guarantee: at >=1300px both frames cap their height at 62cqw of
// the hero images column (container-type: size on the wrapper) - a 4:5
// pair is 1.6x its height wide, so 62cqw keeps the pair within the
// column and overflow-hidden can never clip a photo. The companion only
// renders from 1300px up; below that the hero is copy + primary, which
// holds its perfect 4:5 at every width.
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
        {/* Primary frame. Fixed 4:5 so the pre-cropped photo never
            crops. Height is the column height, capped at 62cqw once the
            companion joins at 1300px so the two frames always fit. */}
        <div className="relative aspect-[4/5] h-full shrink-0 min-[1300px]:h-[min(100%,62cqw)]">
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
                // at ~80vw wide (46svh tall at 4:5), so 80vw keeps the
                // optimizer from fetching a full-viewport-width file.
                sizes="(min-width: 768px) 40vh, 80vw"
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

        {/* Companion panel - the paired photo, right of the pair. Also
            fixed 4:5 so the photo shows whole; same 62cqw height cap so
            the pair never exceeds the column. Hidden below 1300px. */}
        {details && detailCount === count && (
          <div className="relative hidden aspect-[4/5] h-full shrink-0 min-[1300px]:block min-[1300px]:h-[min(100%,62cqw)]">
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
