"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Tag } from "lucide-react";

const CONFIRM_MS = 1500;
// Same critically-damped swap spring as AddToCartButton.tsx's label swap -
// one motion feel for "this label just confirmed" sitewide.
const CONFIRM_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

const OFFER_CODE = "LABLOVE";

// No clipboard library in this repo (and one field doesn't earn adding a
// dependency) - navigator.clipboard.writeText is a plain Web API, no
// install needed. Silently no-ops on failure (denied permission, insecure
// context) rather than surfacing an error for a copy-to-clipboard nicety.
export function PdpOffers() {
  const [copied, setCopied] = useState(false);
  const reduceMotion = useReducedMotion();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(OFFER_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), CONFIRM_MS);
    } catch {
      // clipboard access unavailable - the code is still visible to copy by hand
    }
  }

  return (
    <div className="mt-6 rounded-labelashb-md border border-labelashb-wine/30 bg-labelashb-wine/5 px-4 py-3">
      <div className="flex items-start gap-2.5">
        <Tag className="mt-0.5 h-4 w-4 shrink-0 text-labelashb-wine" aria-hidden="true" />
        <div>
          <p className="text-labelashb-small text-labelashb-ink">
            Get ₹200 off on your first purchase of ₹2,000 or above
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="text-labelashb-small font-semibold tracking-wide text-labelashb-wine">
              {OFFER_CODE}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="text-labelashb-small text-labelashb-ink-soft underline decoration-labelashb-border underline-offset-2 hover:text-labelashb-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? "copied" : "copy"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={reduceMotion ? { duration: 0.1 } : CONFIRM_SPRING}
                  className="inline-block"
                >
                  {copied ? "Copied" : "Copy code"}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
