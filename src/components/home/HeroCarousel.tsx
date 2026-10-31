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

// Hero, two modes on one rotation clock (client: "let the hero image take
// on this whole section - full screen", Oct 30 2026):
// - Below md: the stacked mobile hero keeps its 4:5 primary panel
//   (public/hero/0N.jpg, subject-centered crops). A landscape photo in a
//   phone-width full-bleed frame would slice 60%+ off the model's sides,
//   so mobile does NOT go full-bleed.
// - md+: when `fullSlides` is provided, an absolute full-bleed layer
//   renders the UNCROPPED landscape originals (public/hero/full-0N.jpg,
//   1536x1024) edge to edge with object-cover - the whole hero section is
//   the photo; copy overlays it in page.tsx. Both sets share one index,
//   so resizing across md never desynchronises the garment you're seeing.
//
// All slides render simultaneously (absolute, crossfaded by opacity)
// instead of mounting on index change, so upcoming slides prefetch. Only
// slide 0 of the mobile set takes Next's `priority` (LCP hint for the
// SSR-default layout); the desktop set loads eager but not priority to
// avoid two preload hints.
export function HeroCarousel({
  slides,
  fullSlides,
}: {
  slides: HeroSlide[];
  fullSlides?: HeroSlide[];
}) {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const count = slides.length;
  const fullCount = fullSlides?.length ?? 0;

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % count);
    }, ROTATE_MS);
    return () => clearInterval(id);
    // Re-arming on `index` too means manual navigation (dot click, swipe)
    // gets a full ROTATE_MS before the next auto-advance.
  }, [count, index]);

  if (count === 0) return null;

  const goTo = (next: number) => setIndex(((next % count) + count) % count);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) goTo(index + 1);
    else if (info.offset.x > SWIPE_THRESHOLD) goTo(index - 1);
  }

  const dots = (
    <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
      {slides.map((slide, i) => (
        <button
          key={slide.url}
          type="button"
          aria-label={`Show slide ${i + 1} of ${count}`}
          aria-current={i === index}
          onClick={() => goTo(i)}
          className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-gold focus-visible:ring-offset-1 ${
            i === index
              ? "w-6 bg-labelashb-gold"
              : "w-1.5 bg-labelashb-gold/50 hover:bg-labelashb-gold/80"
          }`}
        />
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile primary (below md): 4:5 frame, height from the parent
          wrapper (46svh cap - fold budget lives in page.tsx). */}
      <motion.div
        className="relative aspect-[4/5] h-full w-full md:hidden"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
        onTouchStart={() => (pausedRef.current = true)}
        onTouchEnd={() => (pausedRef.current = false)}
      >
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
              sizes="80vw"
              loading="eager"
              priority={i === 0}
              className="pointer-events-none object-cover"
            />
          </div>
        ))}
        {dots}
      </motion.div>

      {/* Desktop full-bleed (md+): uncropped landscape originals, cover
          the whole hero section. The parent section is
          h-[calc(100svh-<header>)] with the copy overlaid. */}
      {fullSlides && fullCount === count && (
        <motion.div
          className="absolute inset-0 hidden md:block"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
          onTouchStart={() => (pausedRef.current = true)}
          onTouchEnd={() => (pausedRef.current = false)}
        >
          {fullSlides.map((slide, i) => (
            <div
              key={slide.url}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: i === index ? 1 : 0 }}
              aria-hidden={i !== index}
            >
              <Image
                src={slide.url}
                alt={slide.alt}
                fill
                sizes="100vw"
                loading="eager"
                className="pointer-events-none object-cover"
              />
            </div>
          ))}
          {dots}
        </motion.div>
      )}
    </>
  );
}
