"use client";

import Image from "next/image";
import { useState } from "react";

export interface StudioPanel {
  caption: string;
  // Optional one-line story under the short caption (approved
  // CAPTIONS-DRAFT.md studio lines, Oct 19 2026). Renders as a second
  // small line so the caption row stays quiet.
  note?: string;
  views: Array<{ src: string; alt: string }>;
}

// The Our Studio section (Oct 31 editorial pass): one PROMINENT panel
// paired with two smaller craftsmanship details, instead of three
// identical cards - md+ is a 2x2 featured + stacked pair; mobile stacks
// all three. Panels no longer autoplay (client brief: "avoid multiple
// independently autoplaying image sequences competing for attention") -
// each shows its first view and the dots navigate manually; the dots are
// always visible (small, quiet) so the extra views are discoverable
// without hover. Focus pauses nothing because nothing auto-advances.
export function StudioPanels({ panels }: { panels: StudioPanel[] }) {
  return (
    <div
      className="grid gap-labelashb-carousel-gap md:grid-cols-3 md:grid-rows-[repeat(2,minmax(0,1fr))]"
      role="region"
      aria-label="Inside the Label AshB studio"
      tabIndex={0}
    >
      {panels.map((panel, i) => (
        <Panel key={panel.caption} panel={panel} featured={i === 0} />
      ))}
    </div>
  );
}

function Panel({ panel, featured }: { panel: StudioPanel; featured: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <figure
      className={`group ${featured ? "md:col-span-2 md:row-span-2 md:flex md:flex-col" : ""}`}
    >
      <div
        className={`relative overflow-hidden bg-labelashb-ivory ${
          featured
            ? "aspect-[4/5] md:aspect-auto md:min-h-0 md:flex-1"
            : "aspect-[4/5]"
        }`}
      >
        {panel.views.map((view, index) => (
          <Image
            key={view.src}
            src={view.src}
            alt={view.alt}
            fill
            sizes={
              featured
                ? "(min-width: 768px) 60vw, 90vw"
                : "(min-width: 768px) 30vw, 90vw"
            }
            priority={index === 0 && featured}
            className={`object-cover transition-opacity duration-700 motion-reduce:transition-none ${
              index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
        ))}
        {panel.views.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {panel.views.map((view, index) => (
              <button
                key={view.src}
                type="button"
                aria-label={`Show ${panel.caption.toLowerCase()} view ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
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
