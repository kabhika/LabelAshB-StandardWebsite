"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";

// Same critically-damped swap spring as AddToCartButton.tsx's label swap -
// one motion feel for "this label just confirmed" sitewide.
const CONFIRM_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

// Wired to the insert-only leads table via /api/leads (Phase 3, Oct
// 2026) - before this the form confirmed optimistically and the address
// went nowhere. If storage is unavailable (leads table not created yet,
// network), the confirmation says so and offers WhatsApp instead of
// claiming a capture that didn't happen.
function toWhatsAppHref(displayNumber: string, message: string) {
  const digits = displayNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function NewsletterSignup({ whatsapp }: { whatsapp: string }) {
  const inputId = useId();
  const [result, setResult] = useState<"idle" | "sending" | "saved" | "fallback">(
    "idle",
  );
  const reduceMotion = useReducedMotion();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");
    setResult("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "newsletter",
          company: data.get("company"),
        }),
      });
      const json = (await res.json()) as { ok?: boolean };
      setResult(json.ok ? "saved" : "fallback");
    } catch {
      setResult("fallback");
    }
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
      {/* LABLOVE moved here from the retired exit popup (Oct 31
          refinement pass) - same terms, presented as a quiet line
          instead of an auto-appearing overlay. */}
      <p className="mt-3 text-labelashb-small text-labelashb-ink">
        New here? Code{" "}
        <span className="font-medium tracking-[0.08em]">LABLOVE</span>{" "}
        takes ₹200 off your first order over ₹2,000.
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {result === "saved" ? (
          <motion.p
            key="confirmed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduceMotion ? { duration: 0.1 } : CONFIRM_SPRING}
            className="mt-6 text-labelashb-body text-labelashb-emerald"
          >
            You&apos;re on the list - thank you.
          </motion.p>
        ) : result === "fallback" ? (
          <motion.p
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduceMotion ? { duration: 0.1 } : CONFIRM_SPRING}
            className="mt-6 text-labelashb-body text-labelashb-ink-soft"
          >
            We couldn&apos;t save your email just now -{" "}
            <a
              href={toWhatsAppHref(
                whatsapp,
                "Hi! Please add me to the Label AshB atelier list.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="text-labelashb-ink underline decoration-labelashb-border underline-offset-2 hover:text-labelashb-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
            >
              WhatsApp us
            </a>{" "}
            and we&apos;ll add you personally.
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
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full border border-labelashb-border bg-labelashb-ivory px-4 py-3 text-labelashb-body text-labelashb-ink outline-none placeholder:text-labelashb-ink-soft focus:ring-2 focus:ring-labelashb-accent"
            />
            {/* Honeypot - see /api/leads */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <Button type="submit" variant="primary" disabled={result === "sending"}>
              {result === "sending" ? "Saving..." : "Notify me"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
