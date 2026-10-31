"use client";

import { useEffect, useState } from "react";

const ROTATE_MS = 9000;

// Real, verified claims only (checked against _knowledge/facts.json and
// the Oct 19 2026 brand answers). Per the client's choice (b), LABLOVE
// lives HERE and in a future exit popup - it was removed from the
// product page in the same pass, so this strip is the offer's home.
// Solar line added Oct 2026: facts.json craftPractices + "more than half
// the workshop's power" confirmed by Abhishek.
const MESSAGES = [
  {
    mobile: "Free shipping across India",
    desktop: "Free shipping across India - always.",
  },
  {
    mobile: "Made in our solar-powered atelier",
    desktop: "Every piece cut & finished in our solar-powered atelier.",
  },
  {
    mobile: "Code LABLOVE: ₹200 off orders over ₹2,000",
    desktop: "New here? Use code LABLOVE, get ₹200 off your first order over ₹2,000.",
  },
  {
    mobile: "Ships in 3-4 days · Customised: 10-12 days",
    desktop:
      "Ready-to-ship: shipped in 3 to 4 days. Customised pieces: 10 to 12 days to ship.",
  },
];

// Not aria-live: an auto-rotating promo strip that re-announces itself to
// screen readers is noise, not information - the first message is
// still read once on page load like any static text. Oct 31 refinement
// pass: 5s -> 9s and instant swaps (no fade-through-zero blank moment,
// no layout shift between messages - only the text swaps).
export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const message = MESSAGES[index];

  return (
    // The logo's fabric (.labelashb-fabric, globals.css) with the strip's
    // text in the logo's antique gold - the top band reads as cut from
    // the same cloth as the monogram, not a separate ivory promo strip.
    // Gold hairline at the seam to the nav band echoes the logo's frame.
    <div className="labelashb-fabric overflow-hidden border-b border-labelashb-gold/20 px-4 py-1 text-center text-[0.6875rem] text-labelashb-gold sm:py-1.5 sm:text-labelashb-small">
      {/* key-swap only: no exit animation, so the old message is replaced
          in the same frame - the strip never blanks. */}
      <span key={index}>
        {/* Abbreviated on mobile - the full sentences wrap to 2 lines at
            375px and eat into the hero's tight below-the-fold budget
            (verified: pushed the CTA past the iPhone SE 667px floor). */}
        <span className="sm:hidden">{message.mobile}</span>
        <span className="hidden sm:inline">{message.desktop}</span>
      </span>
    </div>
  );
}
