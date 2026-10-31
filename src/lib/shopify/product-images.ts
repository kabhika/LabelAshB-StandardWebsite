// The single source of truth for "which image(s) represent this product".
//
// WHY THIS MODULE EXISTS (Oct 31 2026, the Crimson Tiles bug): the PDP
// renders gallery images through PRODUCT_IMAGE_OVERRIDES, but the cart
// (src/lib/cart/cart.ts) and the checkout order snapshot
// (src/app/api/checkout/create-order) resolved their thumbnail from the
// raw Supabase product_images rows. For products whose DB rows are stale
// or wrong (the Shopify import left the Crimson Tiles dress with a pink
// dress photo at position 0), the PDP showed the right garment while the
// cart - and the saved order_items.image_url - carried the wrong one.
// Both consumers now resolve through here, so one derivation serves
// product page, cart, order snapshot and any fulfilment view.
//
// This file intentionally has ZERO imports (no Supabase, no React) so it
// is directly unit-testable under plain node (scripts/test-product-images.mjs)
// and importable from server code anywhere.

export interface DbProductImage {
  url: string;
  alt_text?: string | null;
  position?: number | null;
}

const lookbookFiles = [
  "01-front-view.jpg",
  "02-three-quarter-front-view.jpg",
  "03-side-view.jpg",
  "04-back-view.jpg",
  "05-close-up-detail.jpg",
];

const lookbook = (folder: string): string[] =>
  lookbookFiles.map((file) => `/collection/${folder}/${file}`);

const numbered = (folder: string, count: number): string[] =>
  Array.from(
    { length: count },
    (_, i) => `/collection/${folder}/${String(i + 1).padStart(2, "0")}.jpg`,
  );

// Handle -> repo-local images that REPLACE whatever the product_images
// rows say. Keys are Shopify-stable handles, never display order,
// filenames alone, or array positions.
export const PRODUCT_IMAGE_OVERRIDES: Record<string, string[]> = {
  // Azure Whisper gallery was rebuilt from clean library originals (31 Oct
  // 2026) and reduced to 4 views at the client's request; the Supabase
  // product_images rows still list the old 5 (05.jpg no longer exists).
  "azure-whisper-linen-top": numbered("21-azure-whisper-linen-top", 4),
  "alabaster-breeze-kaftan": [
    "/collection/30-alabaster-breeze-kaftan/02.jpg",
    "/collection/30-alabaster-breeze-kaftan/03.jpg",
    "/collection/30-alabaster-breeze-kaftan/04.jpg",
    "/collection/30-alabaster-breeze-kaftan/01.jpg",
  ],
  // Existing listings, real photos from the new shoot (folders 41 to 46)
  "olive-grove-dress": numbered("44-olive-grove-dress", 5),
  "the-crimson-tiles-linen-dress": numbered("45-crimson-tiles-hand-block-cotton-dress", 6),
  "the-midnight-botanical-kaftan-set": numbered("41-midnight-botanical-pure-crepe-kaftan-co-ord-set", 5),
  "the-regal-amethyst-co-ord-set": numbered("42-regal-amethyst-co-ord-set", 4),
  // Existing listings whose garment was already photographed in folders 01 to 18
  "orchid-sheesha-top": lookbook("03-purple-applique-v-neck-tunic"),
  "the-mesa-block-linen-tunic": lookbook("09-camel-cream-charcoal-colourblock-dress"),
  "the-ivory-garden-embroidered-dress": lookbook("10-ivory-floral-embroidered-v-neck-dress"),
  "magenta-reverie": lookbook("07-fuchsia-double-button-maxi-dress"),
  "rani-linen-shirt": lookbook("12-hot-pink-high-low-shirt-set"),
  "the-folk-tale-linen-shirt": numbered("40-folk-tale-linen-co-ord-set", 5),
};

export { lookbook, numbered };

// Every image that should represent the product, best first. Overrides
// win wholesale (they exist precisely because the DB rows are wrong or
// stale for that product); otherwise the DB rows in `position` order -
// the position column is the only ordering authority, so reordering the
// rows array itself cannot change what resolves.
export function authoritativeProductImages(
  handle: string | null | undefined,
  dbImages: DbProductImage[] | null | undefined,
): string[] {
  const override = handle ? PRODUCT_IMAGE_OVERRIDES[handle] : undefined;
  if (override) return override;
  if (!dbImages || dbImages.length === 0) return [];
  return [...dbImages]
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((img) => img.url);
}

// The one image a cart line / order item should show. null when nothing
// authoritative exists - callers must render a neutral placeholder, never
// fall back to "some" product photo.
export function authoritativeProductImage(
  handle: string | null | undefined,
  dbImages: DbProductImage[] | null | undefined,
): string | null {
  return authoritativeProductImages(handle, dbImages)[0] ?? null;
}
