"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Deliberate, not decorative: a single fade/rise on first scroll into view.
// Content is always present in the DOM (SSR-rendered) — only opacity/transform
// animate, so there is never an empty heading in server-rendered HTML.
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
