"use client";

// Fires the ViewContent Pixel event once per product page mount.
// Rendered (server-side) from the product page with plain props.
import { useEffect } from "react";
import { trackMetaEvent } from "@/lib/meta/pixel";

export function ViewContentEvent({
  handle,
  title,
  value,
  currency,
}: {
  handle: string;
  title: string;
  value: number;
  currency: string;
}) {
  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_name: title,
      content_ids: [handle],
      content_type: "product",
      value,
      currency,
    });
    // Fire once per page view; handle changes mean a new page mount anyway
    // (dynamic nav re-runs this effect via the key on the page).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  return null;
}
