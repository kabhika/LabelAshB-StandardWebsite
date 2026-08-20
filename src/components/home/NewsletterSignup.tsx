"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";

// Same critically-damped swap spring as AddToCartButton.tsx's label swap -
// one motion feel for "this label just confirmed" sitewide.
const CONFIRM_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

// No email service is wired up behind this yet (no Klaviyo/Mailchimp
// integration exists in this repo) - submitting only confirms the address
// was captured in this session, it does not send it anywhere. Swap in a
// real provider before relying on this to actually grow a list.
export function NewsletterSignup() {
  const inputId = useId();
  const [submitted, setSubmitted] = useState(false);
  const reduceMotion = useReducedMotion();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-md text-center">
      <h2 className="font-labelashb-serif text-labelashb-h2 text-labelashb-ink">
        Stay close to the atelier
      </h2>
      <p className="mt-3 text-labelashb-body text-labelashb-ink-soft">
        New fabric drops, made-to-order openings, and the occasional note
        from the studio. No spam, unsubscribe any time.
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {submitted ? (
          <motion.p
            key="confirmed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduceMotion ? { duration: 0.1 } : CONFIRM_SPRING}
            className="mt-6 text-labelashb-body text-labelashb-emerald"
          >
            You&apos;re on the list - thank you.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduceMotion ? { duration: 0.1 } : CONFIRM_SPRING}
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>
            <input
              id={inputId}
              type="email"
              required
              placeholder="you@example.com"
              className="w-full border border-labelashb-border bg-labelashb-ivory px-4 py-3 text-labelashb-body text-labelashb-ink outline-none placeholder:text-labelashb-ink-soft focus:ring-2 focus:ring-labelashb-accent"
            />
            <Button type="submit" variant="primary">
              Notify me
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
