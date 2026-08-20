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
          className="group relative block aspect-labelashb-card overflow-hidden bg-labelashb-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-indigo focus-visible:ring-offset-1"
        >
          <Image
            src={tile.image.url}
            alt={tile.image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-labelashb-ink/70 via-labelashb-ink/0 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-5">
            <span className="font-labelashb-serif text-labelashb-h3 text-labelashb-ivory">
              {tile.label}
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-labelashb-ivory transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
