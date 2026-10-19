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

// Two-panel hero: a fixed-2:3 primary frame (the full garment,
// head-to-hem - the photography has no vertical slack to crop) plus an
// optional companion panel of the SAME garment's close-up detail. The
// companion is flex-1, so at lg+ it absorbs whatever width the screen
// hands the hero - the copy-to-image "gaping hole" becomes image
// instead of empty ground, at every viewport width. Detail shots are
// crop-tolerant at any aspect, which the full-body frames are not.
// Both panels live here (not two carousels) so one rotation clock keeps
// them frame-synced forever - separate intervals would drift.
//
// All slides render simultaneously (position: absolute, crossfaded by
// opacity) instead of mounting/unmounting on index change, so the browser
// can fetch upcoming slides ahead of their turn instead of popping in a
// blank frame on every rotation. Only slide 0 gets Next's `priority`
// (LCP hint); the rest use the framework default (lazy).
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
      className="relative h-full w-full overflow-hidden"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={() => (pausedRef.current = true)}
      onTouchEnd={() => (pausedRef.current = false)}
    >
      <motion.div
        className="flex h-full w-full cursor-grab touch-pan-y gap-[2px] active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        {/* Companion detail panel - sits between the copy column and the
            primary frame. The 200px floor + 560px CAP handled wide screens,
            but between lg and ~1300px the surplus width ran out and the
            flex-1 panel collapsed to a ~200px sliver - object-cover then
            cut up to half the photo's width and the model read as
            "squished" (client video, Oct 19). Fix: the panel now only
            renders from 1300px up AND carries a 340px floor, so it stays
            close to a portrait read (<= ~10% side crop) whenever it is
            visible; below that, the hero is copy + primary only, which
            hold their perfect 2:3 at every width. */}
        {details && detailCount === count && (
          <div className="relative hidden min-w-[340px] max-w-[560px] flex-1 min-[1300px]:block">
            {details.map((slide, i) => (
              <div
                key={slide.url}
                className="absolute inset-0 bg-labelashb-ground-alt transition-opacity duration-1000 ease-in-out"
                style={{ opacity: i === index ? 1 : 0 }}
                aria-hidden={i !== index}
              >
                {/* Single cover image. The companion source is now a
                    FULL-BODY view (back view - see collectionHeroDetails),
                    not a macro: a person photo reads as an intentional
                    editorial crop at any panel width, where a macro's
                    edge-to-edge subject read as "cropped" at every one
                    (five client complaints, Sep 1-24). A blur-fill
                    contain variant was tried and rejected - its
                    sharp-to-blur boundary read as a defect. */}
                <Image
                  src={slide.url}
                  alt={slide.alt}
                  fill
                  sizes="(min-width: 1024px) 560px, 100vw"
                  loading="eager"
                  priority={i === 0}
                  className="pointer-events-none object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Primary frame - fixed 2:3 so the garment is never cropped. */}
        <div className="relative aspect-[2/3] h-full shrink-0">
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
                // The primary frame keeps the photos' native 2:3 at every
                // size (70vh from md up - page.tsx), so its width is
                // always ~47vh; the companion takes whatever remains.
                sizes="(min-width: 768px) 47vh, 100vw"
                // Eager for the same mid-fade-pop reason as the
                // companion panel above.
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
      </motion.div>
    </div>
  );
}
