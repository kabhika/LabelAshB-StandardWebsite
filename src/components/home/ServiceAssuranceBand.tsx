"use client";

import { useEffect, useState } from "react";
import { Truck, CalendarClock, RefreshCw } from "lucide-react";

const ROTATE_MS = 9000;

// Three real, verified claims only - checked against _knowledge/facts.json
// and PRODUCT.md before writing (same process as AnnouncementBar.tsx):
// - "Free shipping within India" is AnnouncementBar's own confirmed wording,
//   reused verbatim, not reworded.
// - "Shipped in 3 to 4 days" is the client's confirmed ready-to-ship
//   number (Oct 30 2026: normal ships 3-4 days, customized 10-12 days to
//   ship - SHIP times, not delivery times; no delivery-window promises).
//   Replaces the policy's old "dispatched in 2 working days / delivered
//   in 3-5" wording, corrected in facts-policies.json the same day.
// - COD line REMOVED Oct 19 2026: the client confirmed there is no cash-on-
//   delivery as a selling mode at all (the old "COD via UPI (Local Orders)"
//   no longer reflects how they sell). Replaced with the exchange promise,
//   which is real (facts.json faqs: "We accommodate exchanges for genuine
//   fit issues") - deliberately not the candidate "Easy returns", which
//   would overstate a made-to-order returns policy.
const MESSAGES = [
  { text: "Free shipping within India", Icon: Truck },
  { text: "Ready-to-ship: shipped in 3 to 4 days", Icon: CalendarClock },
  { text: "Easy exchanges for genuine fit issues", Icon: RefreshCw },
];

// Not aria-live: same reasoning as AnnouncementBar.tsx - a strip that
// re-announces itself to screen readers on rotation is noise, not
// information. Oct 31 refinement pass: rotation slowed 4s -> 9s and the
// fade-through-zero swap removed (client: "avoid moments where text
// becomes effectively invisible") - messages swap instantly while the
// strip itself never blanks. Ivory on espresso is ~12.6:1 at all times.
export function ServiceAssuranceBand() {
  const [index, setIndex] = useState(0);

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
      <div className="labelashb-shell flex items-center justify-center overflow-hidden px-6 py-4 sm:px-8 sm:py-5 lg:px-10">
        <p key={index} className="flex items-center gap-3 text-labelashb-body-lg text-labelashb-ivory">
          <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
          <span>{text}</span>
        </p>
      </div>
    </div>
  );
}
