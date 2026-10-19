"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const ROTATE_MS = 5000;
// Same critically-damped swap spring as AddToCartButton.tsx / PdpOffers.tsx -
// one spring feel sitewide for "this label just swapped" motion.
const SWAP_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

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
    mobile: "Ready-to-ship: 3-5 days · Made-to-order: 2-3 weeks",
    desktop: "Ready-to-ship: 3-5 business days. Made-to-order/customized: 2-3 weeks.",
  },
];

// Not aria-live: an auto-rotating promo strip that re-announces itself to
// screen readers every 5s is noise, not information - the first message is
// still read once on page load like any static text.
export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

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
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? { duration: 0.1 } : SWAP_SPRING}
        >
          {/* Abbreviated on mobile - the full sentences wrap to 2 lines at
              375px and eat into the hero's tight below-the-fold budget
              (verified: pushed the CTA past the iPhone SE 667px floor). */}
          <span className="sm:hidden">{message.mobile}</span>
          <span className="hidden sm:inline">{message.desktop}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
