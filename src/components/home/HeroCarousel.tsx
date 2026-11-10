"use client";

import { getImageProps } from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "motion/react";

export interface HeroSlide {
  url: string;
  alt: string;
}

export function HeroCarousel({
  slides,
  fullSlides,
}: {
  slides: HeroSlide[];
  fullSlides: HeroSlide[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const count = slides.length;

  useEffect(() => {
    if (paused || hovered || reduceMotion || count <= 1) return;
    const timer = setTimeout(() => setIndex((current) => (current + 1) % count), 7000);
    return () => clearTimeout(timer);
  }, [count, hovered, index, paused, reduceMotion]);

  const slide = slides[index];
  if (!slide) return null;
  const wideSlide = fullSlides[index] ?? slide;
  const sizes = "(min-width: 768px) 100vw, (min-width: 640px) 80vw, 92vw";
  const { props: mobile } = getImageProps({
    src: slide.url,
    alt: slide.alt,
    width: 880,
    height: 1100,
    sizes,
    loading: "eager",
    fetchPriority: index === 0 ? "high" : "auto",
  });
  const { props: desktop } = getImageProps({
    src: wideSlide.url,
    alt: wideSlide.alt,
    width: 1536,
    height: 960,
    sizes,
  });

  function goTo(next: number) {
    setPaused(true);
    setIndex((next + count) % count);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60) goTo(index + 1);
    else if (info.offset.x > 60) goTo(index - 1);
  }

  return (
    <div
      className="relative order-first mx-auto aspect-[4/5] h-[min(46svh,110vw)] max-w-full md:absolute md:inset-0 md:aspect-auto md:h-full md:w-full"
      role="region"
      aria-label="Collection photos"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="absolute inset-0 overflow-hidden bg-[#e1d5c9] [touch-action:pan-y]"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        <picture>
          <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
          {/* getImageProps supplies Next.js optimization for each picture source. */}
          <img {...mobile} alt={slide.alt} className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
        </picture>
      </motion.div>
      {count > 1 && (
        <div className="absolute right-2 bottom-2 z-20 flex max-w-full items-center gap-0.5 rounded-full bg-labelashb-wine px-2 text-labelashb-ivory md:right-6 md:bottom-6">
          {!reduceMotion && (
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              className="min-h-9 px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {paused ? "Play" : "Pause"}
            </button>
          )}
          {slides.map((item, i) => (
            <button
              key={item.url}
              type="button"
              aria-label={"Show collection photo " + (i + 1) + " of " + count}
              aria-current={i === index ? "true" : undefined}
              onClick={() => goTo(i)}
              className="grid h-8 w-7 place-items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span aria-hidden="true" className={i === index ? "h-2 w-4 rounded-full bg-white" : "h-2 w-2 rounded-full bg-white/60"} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
