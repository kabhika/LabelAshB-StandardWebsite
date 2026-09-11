"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export interface ProcessStage {
  title: string;
  images: Array<{ src: string; alt: string }>;
}

export function ProcessCarousel({ stage }: { stage: ProcessStage }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reducedMotion) return;

    const rotation = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % stage.images.length);
    }, 5000);

    return () => window.clearInterval(rotation);
  }, [paused, stage.images.length]);

  const showImage = (index: number) => {
    setActiveIndex(index);
    setPaused(true);
  };

  return (
    <article
      className="group"
      aria-label={`${stage.title} process images`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="relative aspect-labelashb-process overflow-hidden bg-labelashb-ivory">
        {stage.images.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 82vw"
            priority={index === 0}
            className={`object-cover transition-opacity duration-700 motion-reduce:transition-none ${
              index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent px-4 pb-4 pt-10">
          <span className="font-labelashb-serif text-lg text-white">{stage.title}</span>
          <span className="text-xs tracking-[0.18em] text-white/85">0{activeIndex + 1} / 0{stage.images.length}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2" aria-label={`Choose a ${stage.title.toLowerCase()} image`}>
        {stage.images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            aria-label={`Show ${stage.title.toLowerCase()} image ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
            onClick={() => showImage(index)}
            className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-indigo focus-visible:ring-offset-2 ${
              index === activeIndex ? "w-7 bg-labelashb-wine" : "w-2.5 bg-labelashb-ink/25 hover:bg-labelashb-wine/60"
            }`}
          />
        ))}
      </div>
    </article>
  );
}
