"use client";

// Fires the Google Ads purchase conversion exactly once per order. The
// checkout success page renders this only after the server has re-confirmed
// the order is payment_status "captured" (the URL alone is public
// knowledge, so the page never trusts it for conversion purposes).
// Duplicate protection is three layers deep: the server-side captured
// check, the sessionStorage guard below (refreshes, back-navigation), and
// Google Ads' own de-duplication on transaction_id.

import { useEffect } from "react";

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[][];
  }
}

export function GoogleAdsConversion({
  orderNumber,
  total,
}: {
  orderNumber: string;
  total: number;
}) {
  useEffect(() => {
    const tagId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;
    const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL;
    // No tag configured (pre-campaign deploy) - nothing to send.
    if (!tagId || !label) return;

    const guardKey = `labelashb-ads-conversion:${orderNumber}`;
    try {
      if (sessionStorage.getItem(guardKey)) return;
    } catch {
      // Private-browsing Safari throws on sessionStorage - send anyway and
      // lean on transaction_id de-duplication on Google's side.
    }

    // Race-proof send. On a hard load of this page (direct URL, bookmark,
    // refresh), React flushes this component's effect BEFORE the root
    // layout's next/script effects append the gtag bootstrap - so
    // window.gtag may not exist yet, and waiting for it would silently
    // drop the conversion. The official gtag stub just queues arguments
    // on dataLayer, which gtag.js replays once it loads; borrow it.
    const gtag: GtagFn =
      typeof window.gtag === "function"
        ? window.gtag
        : (...args: unknown[]) => {
            (window.dataLayer = window.dataLayer || []).push(args);
          };

    gtag("event", "conversion", {
      send_to: `${tagId}/${label}`,
      value: total,
      currency: "INR",
      transaction_id: orderNumber,
    });

    try {
      sessionStorage.setItem(guardKey, "1");
    } catch {
      // Same Safari case - nothing further to do.
    }
  }, [orderNumber, total]);

  return null;
}
