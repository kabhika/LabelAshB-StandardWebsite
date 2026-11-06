// Grammar/copy corrections for product descriptions, applied at render
// time in catalog.ts. The Nov 6 2026 site audit found typos and stale
// boilerplate living in the Supabase `products.description` /
// `description_html` rows. Until those rows are corrected at the source
// (supabase/migrations/0006_fix_description_text.sql), this module makes
// every customer-facing surface render the corrected text. Each patch is
// an exact-substring replace, so once the SQL has run the patterns stop
// matching and these become no-ops -- deliberately idempotent, same
// philosophy as PRODUCT_IMAGE_OVERRIDES in product-images.ts.

export interface DescriptionPatch {
  from: string;
  to: string;
}

export const DESCRIPTION_PATCHES: DescriptionPatch[] = [
  // Midnight Botanical Kaftan Set - "arries" is a typo for "carries"
  { from: "modal silk arries a bold botanical", to: "modal silk carries a bold botanical" },
  // Crimson Tiles Dress - full stop glued to the next word
  { from: "clothes.Natural cotton", to: "clothes. Natural cotton" },
  // Care boilerplate on 8 products - missing comma after the "if" clause
  { from: "If washing at home wash separately", to: "If washing at home, wash separately" },
  // Dark Paisley Dress - run-on sentence plus stray mid-sentence capital
  {
    from: "and wash separately which is important for Natural handblock prints",
    to: "and wash separately - this is important for natural handblock prints",
  },
  // Saffron Muse Dress - two contradictory detergent templates concatenated;
  // targeted with the preceding sentence so the legitimate "Use mild
  // detergent only." line on other products (e.g. Rose Broderie) is untouched
  {
    from: "as these are naturally dyed clothes. Use mild detergent only.",
    to: "as these are naturally dyed clothes.",
  },
  // Tile and Terra Set - description still opens with the old misspelled
  // product name (page title was corrected to "Tile and Terra Set")
  { from: "The Saphire Flow Set pairs", to: "The Tile and Terra Set pairs" },
];

export function applyDescriptionPatches(text: string | null | undefined): string {
  if (!text) return "";
  let out = text;
  for (const { from, to } of DESCRIPTION_PATCHES) {
    out = out.split(from).join(to);
  }
  return out;
}
