import Image from "next/image";

export interface ScrollerImage {
  url: string;
  alt: string;
  caption?: string;
  // Optional second caption line (e.g. the fabric-kind notes on the
  // homepage fabric showcase, Oct 2026) - same quiet two-line pattern
  // as StudioPanels' caption/note pair.
  note?: string;
  // Product photography is a 2:3 portrait series. Studio atmosphere panels
  // are intentionally 4:5, so retain the card frame unless the caller marks
  // a supplied product image as portrait.
  frame?: "product";
}

// layout="grid" (Oct 31 2026 layout brief): equal-width columns across the
// parent container instead of the fixed-width snap-scroll row - used by the
// homepage fabric section (3 cards fill the section, no empty right half).
// Below md the grid variant still scrolls as a row - comfortable on phones.
// "scroll" (default) is the generic snap-scroll row.
export type HorizontalImageScrollerProps =
  | { mode?: "scroll"; images: ScrollerImage[]; labelledBy?: string; layout?: "grid" }
  | { mode: "label"; text: string };

export function HorizontalImageScroller(props: HorizontalImageScrollerProps) {
  if (props.mode === "label") {
    return (
      <div className="flex min-h-32 items-center justify-center px-6 text-center">
        <p className="max-w-md text-labelashb-body-lg text-labelashb-ink-soft">
          {props.text}
        </p>
      </div>
    );
  }

  const { images, labelledBy, layout } = props;
  if (images.length === 0) return null;

  // Falls back to a generic label only when the caller has no adjacent
  // heading to point at - a page running several scrollers side by side
  // (fabric collections, studio, process) should give each region its own
  // name via labelledBy, not three identical "Image gallery" landmarks.
  const regionProps = labelledBy
    ? { "aria-labelledby": labelledBy }
    : { "aria-label": "Image gallery" };

  if (layout === "grid") {
    return (
      <div
        role="region"
        {...regionProps}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-labelashb-carousel-gap overflow-x-auto pb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-indigo focus-visible:ring-offset-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:[scrollbar-width:auto] md:[&::-webkit-scrollbar]:block"
      >
        {images.map((image, i) => (
          <figure key={image.url} className="w-72 flex-none snap-start sm:w-96 md:w-auto">
            <div className={`relative overflow-hidden bg-labelashb-ground-alt ${image.frame === "product" ? "aspect-labelashb-product" : "aspect-labelashb-card"}`}>
              <div className={image.frame === "product" ? "relative h-full w-full" : "absolute inset-0"}>
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 768px) 30vw, 24rem"
                  priority={i === 0}
                  className="object-cover"
                />
              </div>
            </div>
            {image.caption && (
              <figcaption className="mt-labelashb-card-caption">
                <span className="text-labelashb-small text-labelashb-ink">{image.caption}</span>
                {image.note && (
                  <span className="mt-0.5 block max-w-md text-labelashb-small text-labelashb-ink-soft">
                    {image.note}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    );
  }

  return (
    <div
      role="region"
      {...regionProps}
      tabIndex={0}
      className="flex snap-x snap-mandatory gap-labelashb-carousel-gap overflow-x-auto pb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-indigo focus-visible:ring-offset-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {images.map((image, i) => (
        <figure key={image.url} className="w-72 flex-none snap-start sm:w-96">
          <div className={`relative overflow-hidden bg-labelashb-ground-alt ${image.frame === "product" ? "aspect-labelashb-product" : "aspect-labelashb-card"}`}>
            <div className={image.frame === "product" ? "relative h-full w-full" : "absolute inset-0"}>
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 24rem, 18rem"
                priority={i === 0}
                // Product frames bleed edge to edge (Shree reference, Oct
                // 29); atmosphere frames are pre-cropped 4:5 covers.
                className="object-cover"
              />
            </div>
          </div>
          {image.caption && (
            <figcaption className="mt-labelashb-card-caption">
              <span className="text-labelashb-small text-labelashb-ink">{image.caption}</span>
              {image.note && (
                <span className="mt-0.5 block max-w-md text-labelashb-small text-labelashb-ink-soft">
                  {image.note}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
