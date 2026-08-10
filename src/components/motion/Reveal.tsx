"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Deliberate, not decorative: a single fade/rise on mount. Content is
// always present in the DOM (SSR-rendered) - only opacity/transform
// animate, so there is never an empty heading in server-rendered HTML.
//
// Uses "animate" on mount, not "whileInView". whileInView depends on
// IntersectionObserver + rAF, both of which stall on a backgrounded/
// unfocused tab - confirmed live (document.visibilityState "hidden" froze
// the hero mid-fade at opacity 0.33 indefinitely). Above-the-fold content
// that's already visible on load shouldn't depend on viewport-intersection
// timing at all.
export function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
