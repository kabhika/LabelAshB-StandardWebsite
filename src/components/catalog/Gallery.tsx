"use client";

import { useState } from "react";
import Image from "next/image";
import type { NormalizedProduct } from "@/lib/shopify/catalog";

export function Gallery({
  images,
  productTitle,
}: {
  images: NormalizedProduct["images"];
  productTitle: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (!active) {
    return (
      <div className="aspect-[3/4] w-full bg-labelashb-ground-alt" aria-hidden />
    );
  }

  return (
    <div>
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-labelashb-ground-alt">
        <Image
          src={active.url}
          alt={active.altText || productTitle}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === activeIndex}
              className={`relative h-20 w-16 shrink-0 overflow-hidden border ${
                index === activeIndex
                  ? "border-labelashb-ink"
                  : "border-labelashb-border"
              }`}
            >
              <Image
                src={image.url}
                alt={image.altText || productTitle}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
