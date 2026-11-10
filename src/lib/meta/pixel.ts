// Meta Pixel client helpers. Everything here is inert until
// NEXT_PUBLIC_META_PIXEL_ID is set, so deploying the code before the env
// var exists changes nothing on the storefront.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function metaPixelId(): string | null {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  return id && /^\d{10,20}$/.test(id) ? id : null;
}

/**
 * Fire a standard browser Pixel event. Safe to call anywhere client-side:
 * no-ops when the pixel is not configured or still loading.
 */
export function trackMetaEvent(
  event: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params ?? {});
}
