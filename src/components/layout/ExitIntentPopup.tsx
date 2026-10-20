"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

// LABLOVE exit popup (Phase 3, Oct 2026) - the second half of the
// coupon's home per the client's choice (b): the announcement bar
// carries the code on-site, this card catches a visitor on the way out
// and turns the goodbye into an email for the atelier's list. Storage
// is insert-only (leads table, migration 0004); if the table is
// missing the card still hands over the code and offers WhatsApp, so
// the visitor is never blocked on infrastructure.
//
// Triggers: mouseout through the top edge (desktop exit intent) or a
// 45s timer as the touch/mobile fallback. At most once every 7 days
// per browser (localStorage), never on checkout pages. The code shows
// after the email submit - but the offer is already public in the
// announcement bar, so the reveal is a nicety, not a paywall.
const STORAGE_KEY = "labelashb-exit-popup-at";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const TIMER_FALLBACK_MS = 45_000;

function toWhatsAppHref(displayNumber: string, message: string) {
  const digits = displayNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function ExitIntentPopup({ whatsapp }: { whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emailId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const show = () => {
      const last = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
      if (Date.now() - last < COOLDOWN_MS) return;
      if (pathname?.startsWith("/checkout")) return;
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
      setOpen(true);
    };

    // Desktop exit intent: cursor leaves the viewport through the top.
    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) show();
    };
    // Touch devices have no exit cursor - a timer is the honest fallback.
    const timer = setTimeout(show, TIMER_FALLBACK_MS);

    document.addEventListener("mouseout", onMouseOut);
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      clearTimeout(timer);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "exit_popup",
          company: data.get("company"),
        }),
      });
      const json = (await res.json()) as { ok?: boolean };
      if (!json.ok) setFallback(true);
    } catch {
      setFallback(true);
    } finally {
      setSubmitting(false);
      setDone(true);
    }
  }

  const waHref = toWhatsAppHref(
    whatsapp,
    "Hi! Please keep ₹200 (code LABLOVE) aside for my first order.",
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? { duration: 0.1 } : { duration: 0.25 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-labelashb-ink/40 p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-popup-heading"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 16, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={
              reduceMotion
                ? { duration: 0.1 }
                : { type: "spring", bounce: 0, duration: 0.4 }
            }
            className="relative w-full max-w-md border border-labelashb-gold/40 bg-labelashb-ivory p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-labelashb-ink-soft transition-colors hover:text-labelashb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <p className="text-labelashb-eyebrow uppercase tracking-[0.28em] text-labelashb-accent">
              Before you go
            </p>
            <h2
              id="exit-popup-heading"
              className="font-labelashb-serif mt-3 text-labelashb-h2 text-labelashb-ink"
            >
              Take ₹200 with you
            </h2>

            {done ? (
              <div className="mt-4">
                <p className="text-labelashb-body text-labelashb-ink-soft">
                  Your code is{" "}
                  <span className="font-medium text-labelashb-ink">LABLOVE</span>{" "}
                  - ₹200 off orders over ₹2,000, at checkout.
                </p>
                {fallback ? (
                  <p className="mt-3 text-labelashb-small text-labelashb-ink-soft">
                    We couldn&apos;t save your email just now -{" "}
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-labelashb-ink underline decoration-labelashb-border underline-offset-2 hover:text-labelashb-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
                    >
                      message us on WhatsApp
                    </a>{" "}
                    and we&apos;ll keep it aside for you.
                  </p>
                ) : (
                  <p className="mt-3 text-labelashb-small text-labelashb-ink-soft">
                    Your email is with the atelier - new pieces reach this
                    list first.
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5">
                <p className="text-labelashb-body text-labelashb-ink-soft">
                  ₹200 off your first order over ₹2,000. Leave your email
                  and the code is yours.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <label htmlFor={emailId} className="sr-only">
                    Email address
                  </label>
                  <input
                    ref={inputRef}
                    id={emailId}
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
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? "Sending..." : "Send my code"}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
