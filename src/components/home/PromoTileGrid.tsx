import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface PromoTile {
  image: { url: string; alt: string };
  label: string;
  href: string;
}

// auto-fit/minmax, not a hardcoded grid-cols-4: the catalog has 3 real
// categories, not 4 (PLACEHOLDER-POLICY.md), and this grid needs to read
// cleanly at that count - and at whatever count a future promo row passes -
// without a breakpoint tuned to a tile count that may not stay 3.
export function PromoTileGrid({ tiles }: { tiles: PromoTile[] }) {
  if (tiles.length === 0) return null;

  return (
    <div
      className="grid gap-labelashb-carousel-gap"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))" }}
    >
      {tiles.map((tile) => (
        <Link
          key={tile.href}
          href={tile.href}
          className="group relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-indigo focus-visible:ring-offset-1"
        >
          {/* Oct 31 editorial pass: the beige photo fade is gone - the
              label sits UNDER the image like the product cards (client:
              solid backgrounds, restrained detail, no gradient washes). */}
          <div className="relative aspect-labelashb-product overflow-hidden bg-labelashb-ground-alt">
            <Image
              src={tile.image.url}
              alt={tile.image.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-opacity duration-500 ease-out motion-reduce:transition-none group-hover:opacity-90"
            />
          </div>
          <div className="mt-labelashb-card-caption flex items-center justify-between gap-3">
            <span className="font-labelashb-serif text-labelashb-h3 text-labelashb-ink">
              {tile.label}
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-labelashb-ink transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
