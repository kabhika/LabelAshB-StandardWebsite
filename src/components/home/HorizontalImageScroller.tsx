import Image from "next/image";

export interface ScrollerImage {
  url: string;
  alt: string;
  caption?: string;
}

// "scroll" (default) is the generic snap-scroll row - same rendering path
// whether `images` holds stock/generic photography (studio, process) or
// real assets later, per PLACEHOLDER-POLICY.md. "label" swaps the whole
// row for a quiet text line: today only the testimonials section reaches
// for it, since no real customer quotes exist yet to put in a scroller -
// a placeholder quote would assert something specific and unverified,
// which this brand's quiet/honest voice doesn't do (PRODUCT.md).
export type HorizontalImageScrollerProps =
  | { mode?: "scroll"; images: ScrollerImage[]; labelledBy?: string }
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

  const { images, labelledBy } = props;
  if (images.length === 0) return null;

  // Falls back to a generic label only when the caller has no adjacent
  // heading to point at - a page running several scrollers side by side
  // (fabric collections, studio, process) should give each region its own
  // name via labelledBy, not three identical "Image gallery" landmarks.
  const regionProps = labelledBy
    ? { "aria-labelledby": labelledBy }
    : { "aria-label": "Image gallery" };

  return (
    <div
      role="region"
      {...regionProps}
      tabIndex={0}
      className="flex snap-x snap-mandatory gap-labelashb-carousel-gap overflow-x-auto pb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-indigo focus-visible:ring-offset-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {images.map((image, i) => (
        <figure key={image.url} className="w-72 flex-none snap-start sm:w-96">
          <div className="relative aspect-labelashb-card overflow-hidden bg-labelashb-ivory">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 640px) 24rem, 18rem"
              priority={i === 0}
              className="object-cover"
            />
          </div>
          {image.caption && (
            <figcaption className="mt-labelashb-card-caption text-labelashb-small text-labelashb-ink-soft">
              {image.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
