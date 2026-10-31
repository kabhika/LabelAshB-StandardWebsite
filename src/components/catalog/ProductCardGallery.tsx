import Image from "next/image";

interface GalleryImage {
  url: string;
  altText: string | null;
}

// Card gallery (Oct 31 refinement): the primary photo always shows; the
// product's SECOND photo crossfades in on desktop hover or keyboard focus
// (group / group-focus-within - the parent card's Link carries the group).
// Pure CSS, so it needs no client JS, works without a mouse, and
// motion-reduce drops the fade. This replaces the old hover TIMER that
// cycled every photo every 1.1s - busy, and useless on touch.
export function ProductCardGallery({
  images,
  alt,
}: {
  images: GalleryImage[];
  alt: string;
}) {
  if (images.length === 0) {
    return <div className="absolute inset-0 bg-labelashb-ground-alt" />;
  }

  const second = images[1];

  return (
    <>
      <Image
        src={images[0].url}
        alt={images[0].altText || alt}
        fill
        sizes="(min-width: 1536px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        priority
        // cover, no mat: tiles bleed edge to edge (Shree reference,
        // Oct 29); 2:3 sources fill exactly, others crop at the sides.
        className="object-cover"
      />
      {second && (
        <Image
          src={second.url}
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 1536px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          loading="lazy"
          className="object-cover opacity-0 transition-opacity duration-500 ease-out motion-reduce:transition-none group-hover:opacity-100 group-focus-within:opacity-100"
        />
      )}
    </>
  );
}
