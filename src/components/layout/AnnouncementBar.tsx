"use client";

// Oct 31 2026 header redesign: the strip is now a single static message
// ("Free shipping across India") on solid deep espresso - the rotating
// promo sequence went away with the fabric texture it was cut from. The
// LABLOVE offer and atelier notes still live on the pages that sell them;
// this strip is deliberately quiet so the gold logo bar below carries the
// brand. Same text at every width - one short line never wraps.
export function AnnouncementBar() {
  return (
    <div className="border-b border-labelashb-olive-light/25 bg-labelashb-espresso-deep px-4 py-[7px] text-center text-labelashb-small tracking-wide text-labelashb-gold/90">
      Free shipping across India
    </div>
  );
}
