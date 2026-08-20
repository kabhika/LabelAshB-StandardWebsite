"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

interface GalleryImage {
  url: string;
  altText: string | null;
}

const CYCLE_MS = 1100;

// Hover-swap gallery: cursor over the card cycles through every product
// photo on a timer, dots below show count/position. Crossfade duration
// is set via inline style from --labelashb-duration-card-hover (Phase 1
// card anatomy token, see globals.css), not a hardcoded number, so it
// stays in sync with that token. Must be an inline style, not a Tailwind
// arbitrary-value duration class - see the comment above that token's
// declaration in globals.css for why.
export function ProductCardGallery({
  images,
  alt,
}: {
  images: GalleryImage[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasGallery = images.length > 1;

  useEffect(() => {
    if (!hovered || !hasGallery || reduceMotion) return;
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, CYCLE_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hovered, hasGallery, reduceMotion, images.length]);

  const handleLeave = () => {
    setHovered(false);
    setIndex(0);
  };

  if (images.length === 0) {
    return <div className="absolute inset-0 bg-labelashb-ivory" />;
  }

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => hasGallery && setHovered(true)}
      onMouseLeave={handleLeave}
    >
      {images.map((image, i) => (
        <Image
          key={image.url}
          src={image.url}
          alt={image.altText || alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={i === 0}
          style={{ transitionDuration: "var(--labelashb-duration-card-hover)" }}
          className={`object-cover transition-opacity ease-out motion-reduce:transition-none ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {hasGallery && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5"
        >
          {images.map((image, i) => (
            <span
              key={image.url}
              className={`h-1 w-1 rounded-full drop-shadow-sm transition-colors duration-150 ${
                i === index ? "bg-labelashb-indigo" : "bg-labelashb-ivory/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
