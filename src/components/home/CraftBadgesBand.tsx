import type { SVGProps } from "react";

// Bespoke medallion icon set, original artwork - not sourced from any icon
// library or reference site. Each icon is a full 64x64 illustration (ring +
// ticks + artwork in one piece, not a CSS circle wrapped around a generic
// glyph) so it reads as a coin/seal struck for this brand, echoing the
// logo's circular "AB" mark and the footer's scalloped tick rhythm
// (SiteFooter.tsx's FooterMotifStrip) rather than default icon-library
// output. One shared stroke spec ties the set together.
const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 1.25, strokeLinecap: "round", strokeLinejoin: "round" } as const;

// 16-tick coin edge, shared by every medallion - same rhythm as the
// footer's repeating scallop strip, scaled down to badge size.
function MedallionRing() {
  const ticks = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const x1 = 32 + Math.cos(angle) * 29;
    const y1 = 32 + Math.sin(angle) * 29;
    const x2 = 32 + Math.cos(angle) * 26;
    const y2 = 32 + Math.sin(angle) * 26;
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
  });
  return (
    <>
      <circle cx="32" cy="32" r="31" strokeWidth="1" />
      <g strokeWidth="1">{ticks}</g>
    </>
  );
}

// Three draped ribbon-folds, crossing at different depths - one per fabric
// (linen/silk/cotton), not a generic spool-of-thread glyph.
function FabricIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" {...STROKE} {...props}>
      <MedallionRing />
      <path d="M17 24c6 4 10-4 16 0s10-4 16 0" opacity="0.55" />
      <path d="M16 32c6 4 11-4 17 0s10-4 15 0" />
      <path d="M18 40c6 4 10-4 16 0s10-4 16 0" opacity="0.55" />
    </svg>
  );
}

// Carved block, face down, stamping a small four-point floret impression -
// a signature motif, not a plain dot grid.
function HandBlockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" {...STROKE} {...props}>
      <MedallionRing />
      <rect x="22" y="16" width="20" height="14" rx="1.5" />
      <path d="M32 20v6M29 23h6" />
      <path d="M26 30v5M38 30v5" />
      <path d="M15 41c5-2 8-2 11 0s7 2 12 0 7-2 11 0" />
      <path d="M32 39.5l1.6 3.4 3.6.4-2.7 2.4.8 3.6L32 47.5l-3.3 1.7.8-3.6-2.7-2.4 3.6-.4z" />
    </svg>
  );
}

// Tailor's tag on a loop of thread, corner folded like a real garment
// label - the "scheduled, made specifically for you" idea without reaching
// for a generic calendar-app icon.
function MadeToOrderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" {...STROKE} {...props}>
      <MedallionRing />
      <path d="M32 15c-3 0-4 2-4 4v3" />
      <circle cx="32" cy="15" r="2.2" />
      <path d="M22 22h16l6 6-11 15-11-15Z" />
      <circle cx="27.5" cy="27" r="1.6" fill="currentColor" stroke="none" />
      <path d="M25.5 34.5l3.5 3.5 7-8" />
    </svg>
  );
}

// Dye vessel with a rising ripple and a plant sprig resting on the rim -
// the white-fabric-to-plant-dye process in one small scene, not a stock
// leaf glyph.
function PlantDyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" {...STROKE} {...props}>
      <MedallionRing />
      <path d="M21 28h22l-2.5 18a3 3 0 0 1-3 2.6h-11a3 3 0 0 1-3-2.6Z" />
      <path d="M18 28h28" />
      <path d="M25 33c2 2 2 4 0 6M32 33c2 2 2 4 0 6M39 33c2 2 2 4 0 6" opacity="0.6" />
      <path d="M40 22c0-4 3-6 3-6s3 2 3 6-3 6-3 6-3-2-3-6Z" />
      <path d="M43 22v6" />
    </svg>
  );
}

// Three real, verified claims, plus the now-confirmed plant-dye process
// (see _knowledge/facts.json craftPractices, confirmed by Abhishek
// 2026-08-22) - checked before writing, same discipline as the first pass:
// - "Pure Linen, Pure Silk, Pure Cotton" matches the hero copy and care
//   instructions (handloom linen, pure silk crepe, Indian mulberry silk).
// - "Hand-Block Printed" matches facts.json careInstructions ("intricate
//   handblock prints").
// - "Made to Order" matches PRODUCT.md's Operating Context and the
//   homepage's own "Why Label AshB" copy.
// - "Hand-Dyed with Plant Dyes" matches facts.json craftPractices: fabric
//   is sourced white, then hand-dyed with plant dyes to the requested
//   color before being made into garments.
const BADGES = [
  { label: "Pure Linen, Pure Silk, Pure Cotton", Icon: FabricIcon },
  { label: "Hand-Block Printed", Icon: HandBlockIcon },
  { label: "Made to Order", Icon: MadeToOrderIcon },
  { label: "Hand-Dyed with Plant Dyes", Icon: PlantDyeIcon },
];

// Full-width trust band, indigo ground - same token as the homepage's
// jewel-tone system (DESIGN.md), not a new navy.
export function CraftBadgesBand() {
  return (
    <section className="bg-labelashb-indigo px-6 py-labelashb-section-standard sm:px-10 lg:px-16" aria-label="Our craft">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4 sm:gap-8">
        {BADGES.map(({ label, Icon }) => (
          <div key={label} className="flex flex-col items-center gap-4 text-center">
            <Icon className="h-20 w-20 shrink-0 text-labelashb-ivory" aria-hidden="true" />
            <p className="max-w-[11rem] text-labelashb-small text-labelashb-ivory">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
