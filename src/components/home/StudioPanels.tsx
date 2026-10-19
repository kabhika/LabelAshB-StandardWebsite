"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export interface StudioPanel {
  caption: string;
  // Optional one-line story under the short caption (approved
  // CAPTIONS-DRAFT.md studio lines, Oct 19 2026). Renders as a second
  // small line so the caption row stays quiet.
  note?: string;
  views: Array<{ src: string; alt: string }>;
}

const ROTATE_MS = 5000;

// The Our Studio row: same scroller visual language as
// HorizontalImageScroller (fixed 4:5 figures with captions, snap-scroll
// row), but each figure is itself a quiet crossfading carousel through
// that panel's views. Rotation cadence, hover-pause, focus-pause and
// reduced-motion handling mirror ProcessCarousel.tsx - one interaction
// model for every rotating gallery on the site. Dots sit ON the image
// (small, bottom-center, like the hero) rather than under the caption,
// so the caption row stays a quiet single line.
export function StudioPanels({ panels }: { panels: StudioPanel[] }) {
  return (
    <div
      className="flex snap-x snap-mandatory gap-labelashb-carousel-gap overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="region"
      aria-label="Inside the Label AshB studio"
      tabIndex={0}
    >
      {panels.map((panel) => (
        <Panel key={panel.caption} panel={panel} />
      ))}
    </div>
  );
}

function Panel({ panel }: { panel: StudioPanel }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reducedMotion || panel.views.length <= 1) return;

    const rotation = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % panel.views.length);
    }, ROTATE_MS);
    return () => window.clearInterval(rotation);
  }, [paused, panel.views.length]);

  const showView = (index: number) => {
    setActiveIndex(index);
    setPaused(true);
  };

  return (
    <figure
      className="group w-72 flex-none snap-start sm:w-96"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="relative aspect-labelashb-card overflow-hidden bg-labelashb-ivory">
        {panel.views.map((view, index) => (
          <Image
            key={view.src}
            src={view.src}
            alt={view.alt}
            fill
            sizes="(min-width: 640px) 24rem, 18rem"
            priority={index === 0}
            className={`object-cover transition-opacity duration-700 motion-reduce:transition-none ${
              index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
        ))}
        {panel.views.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 opacity-0 transition-opacity duration-300 focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none">
            {panel.views.map((view, index) => (
              <button
                key={view.src}
                type="button"
                aria-label={`Show ${panel.caption.toLowerCase()} view ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => showView(index)}
                className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 ${
                  index === activeIndex
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/60 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <figcaption className="mt-labelashb-card-caption">
        <span className="text-labelashb-small text-labelashb-ink">{panel.caption}</span>
        {panel.note && (
          <span className="mt-0.5 block text-labelashb-small text-labelashb-ink-soft">
            {panel.note}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
