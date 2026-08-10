"use client";

import { useEffect, useState } from "react";

// Reads the live --color-labelashb-* custom properties instead of
// duplicating hex values here - a hardcoded second copy would drift the
// moment globals.css changes and nobody updated this file to match.
//
// Swatch classes are written out in full below (not built with a template
// literal) because Tailwind's compiler only picks up class names it can see
// as literal strings in the source - a constructed `bg-labelashb-${slug}`
// string would never make it into the generated CSS.
const TOKENS = [
  { slug: "ink", swatchClass: "bg-labelashb-ink" },
  { slug: "ink-soft", swatchClass: "bg-labelashb-ink-soft" },
  { slug: "ground", swatchClass: "bg-labelashb-ground" },
  { slug: "ground-alt", swatchClass: "bg-labelashb-ground-alt" },
  { slug: "border", swatchClass: "bg-labelashb-border" },
  { slug: "accent", swatchClass: "bg-labelashb-accent" },
  { slug: "accent-hover", swatchClass: "bg-labelashb-accent-hover" },
  { slug: "accent-soft", swatchClass: "bg-labelashb-accent-soft" },
  { slug: "error", swatchClass: "bg-labelashb-error" },
  { slug: "error-soft", swatchClass: "bg-labelashb-error-soft" },
] as const;

export function PaletteGrid() {
  const [hexValues, setHexValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const values: Record<string, string> = {};
    for (const { slug } of TOKENS) {
      values[slug] = styles.getPropertyValue(`--color-labelashb-${slug}`).trim();
    }
    setHexValues(values);
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {TOKENS.map(({ slug, swatchClass }) => (
        <div key={slug} className="border border-labelashb-border">
          <div className={`h-20 ${swatchClass}`} aria-hidden />
          <div className="p-3">
            <p className="text-labelashb-small text-labelashb-ink">
              labelashb-{slug}
            </p>
            <p className="text-labelashb-small text-labelashb-ink-soft">
              {hexValues[slug] || " "}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
