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

// All slides render simultaneously (position: absolute, crossfaded by
// opacity) instead of mounting/unmounting on index change, so the browser
// can fetch upcoming slides ahead of their turn instead of popping in a
// blank frame on every rotation. Only slide 0 gets Next's `priority`
// (LCP hint); the rest use the framework default (lazy).
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const count = slides.length;

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
        className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.url}
            className="absolute inset-0 bg-labelashb-ground-alt transition-opacity duration-700 ease-out"
            style={{ opacity: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.url}
              alt={slide.alt}
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              priority={i === 0}
              className="pointer-events-none object-contain"
            />
          </div>
        ))}
      </motion.div>

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
  );
}
