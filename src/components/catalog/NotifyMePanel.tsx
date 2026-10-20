"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";

// Restock capture for sold-out sizes (Phase 3, Oct 2026): an email box
// where a dead "Out of stock" button used to be. Writes to the
// insert-only leads table (migration 0004) with source 'notify_size'
// and the product/size stamped on the row; if storage is unavailable
// (migration not run yet, network) the panel says so honestly and
// offers the WhatsApp path instead - the atelier gets the request
// either way, and the shopper is never told "you're on the list" when
// nothing was recorded.
function toWhatsAppHref(displayNumber: string, message: string) {
  const digits = displayNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function NotifyMePanel({
  whatsapp,
  productTitle,
  productHandle,
  variantTitle,
}: {
  whatsapp: string;
  productTitle: string;
  productHandle: string;
  variantTitle: string | null;
}) {
  const inputId = useId();
  const [state, setState] = useState<"idle" | "sending" | "saved" | "fallback">("idle");

  const sizeLabel = variantTitle ? `size ${variantTitle}` : "this piece";
  const waHref = toWhatsAppHref(
    whatsapp,
    `Hi! Please tell me when the ${productTitle} is back in ${sizeLabel}. https://labelashb.in/products/${productHandle}`,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    setState("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "notify_size",
          productHandle,
          variantTitle,
          company: data.get("company"),
        }),
      });
      const json = (await res.json()) as { ok?: boolean };
      // ok:false covers both validation failure and a missing leads
      // table - either way the address was NOT stored, so fall back.
      setState(json.ok ? "saved" : "fallback");
    } catch {
      setState("fallback");
    }
  }

  if (state === "saved") {
    return (
      <p className="mt-2 text-labelashb-small text-labelashb-emerald">
        Done - we&apos;ll email you the moment {sizeLabel} is back.
      </p>
    );
  }

  return (
    <div className="w-full sm:max-w-sm">
      <p className="text-labelashb-small text-labelashb-ink">
        {variantTitle ? `Size ${variantTitle}` : "This piece"} is sold out.
      </p>
      {state === "fallback" ? (
        <p className="mt-2 text-labelashb-small text-labelashb-ink-soft">
          We couldn&apos;t save your email just now -{" "}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-labelashb-ink underline decoration-labelashb-border underline-offset-2 hover:text-labelashb-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
          >
            WhatsApp us
          </a>{" "}
          and we&apos;ll tell you personally when it&apos;s back.
        </p>
      ) : (
        <>
          <p className="mt-1 text-labelashb-small text-labelashb-ink-soft">
            We cut new pieces every week - leave your email and we&apos;ll
            write the moment it&apos;s back.
          </p>
          <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>
            <input
              id={inputId}
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full border border-labelashb-border bg-labelashb-ivory px-4 py-2.5 text-labelashb-small text-labelashb-ink outline-none placeholder:text-labelashb-ink-soft focus:ring-2 focus:ring-labelashb-accent"
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
            <Button type="submit" variant="secondary" disabled={state === "sending"}>
              {state === "sending" ? "Saving..." : "Notify me"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
