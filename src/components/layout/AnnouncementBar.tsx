"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const ROTATE_MS = 5000;
// Same critically-damped swap spring as AddToCartButton.tsx / PdpOffers.tsx -
// one spring feel sitewide for "this label just swapped" motion.
const SWAP_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

// Three real, already-verified claims only - no invented threshold or
// worldwide-shipping claim (checked against _knowledge/facts-policies.json:
// free shipping there is domestic-only with no stated minimum: PRODUCT.md
// separately confirms international ships via DHL with customer-borne
// duties, i.e. not free). Offer terms mirror PdpOffers.tsx's OFFER_CODE/
// copy verbatim, not reworded.
const MESSAGES = [
  {
    mobile: "Ready-to-ship: 3-5 days · Made-to-order: 2-3 weeks",
    desktop: "Ready-to-ship: 3-5 business days. Made-to-order/customized: 2-3 weeks.",
  },
  {
    mobile: "Code LABLOVE: ₹200 off orders over ₹2,000",
    desktop: "Use code LABLOVE, get ₹200 off your first order over ₹2,000.",
  },
  {
    mobile: "Free shipping within India",
    desktop: "Free standard shipping on all orders within India.",
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
    <div className="overflow-hidden bg-labelashb-ivory px-4 py-1 text-center text-[0.6875rem] text-labelashb-wine sm:py-1.5 sm:text-labelashb-small">
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
