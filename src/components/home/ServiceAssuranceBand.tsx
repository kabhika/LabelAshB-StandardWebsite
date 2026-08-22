"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Truck, CalendarClock, Smartphone } from "lucide-react";

const ROTATE_MS = 4000;
// Same critically-damped swap spring as AnnouncementBar.tsx / AddToCartButton.tsx -
// one spring feel sitewide for "this label just swapped" motion.
const SWAP_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

// Three real, verified claims only - checked against _knowledge/facts.json
// and PRODUCT.md before writing (same process as AnnouncementBar.tsx):
// - "Free shipping within India" is AnnouncementBar's own confirmed wording,
//   reused verbatim, not reworded.
// - "Ready to Ship in 2 Days" matches the confirmed ready-to-ship dispatch
//   window (facts.json faqs: "dispatched within 2 working days").
// - "COD via UPI (Local Orders)" matches the confirmed payment terms
//   (facts.json faqs: "Cash on Delivery is through UPI payments for local
//   orders. Outstation orders require prepayment") - deliberately not the
//   candidate "COD Available", which would overstate this as cash-in-hand
//   COD available everywhere.
const MESSAGES = [
  { text: "Free shipping within India", Icon: Truck },
  { text: "Ready to Ship in 2 Days", Icon: CalendarClock },
  { text: "COD via UPI (Local Orders)", Icon: Smartphone },
];

// Not aria-live: same reasoning as AnnouncementBar.tsx - a strip that
// re-announces itself to screen readers every few seconds is noise, not
// information. The first message is still read once on page load like any
// static text.
export function ServiceAssuranceBand() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const { text, Icon } = MESSAGES[index];

  return (
    <div className="w-full bg-labelashb-wine">
      {/* Matching AnnouncementBar.tsx's own py-1/sm:py-1.5 (prior pass)
          still read as a thin strip, not a band - this is a deliberately
          separate, more prominent treatment: roughly 4x that padding plus
          text/icon scaled up together, so the extra room reads as a
          confident band rather than small content floating in a bigger
          box. */}
      <div className="mx-auto flex max-w-6xl items-center justify-center overflow-hidden px-6 py-4 sm:px-10 sm:py-5 lg:px-16">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0.1 } : SWAP_SPRING}
            className="flex items-center gap-3 text-labelashb-body-lg text-labelashb-ivory"
          >
            <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span>{text}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
