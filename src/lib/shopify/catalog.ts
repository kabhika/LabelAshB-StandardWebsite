// Despite the file path (kept to avoid touching every import site across
// the app in one diff -- see MIGRATION.md), this reads the catalog from
// Supabase, not Shopify. Shopify independence, 1 Sep 2026: the migration
// script (scripts/migrate-shopify-to-supabase.ts) already normalized
// category, self-hosted every image, and carried materials/prices over,
// so this file is mostly a shape-preserving read layer -- the exported
// NormalizedProduct/NormalizedVariant types and function names
// (getCatalog, getProductByHandle, DISPLAY_CATEGORIES, KNOWN_MATERIALS,
// MATERIAL_GROUPS) are unchanged so every consumer needed zero edits.
//
// TODO next pass: rename this module (and its import path everywhere) to
// something that doesn't say "shopify". Left as-is for this diff to keep
// the change reviewable.

import { supabaseCatalog } from "@/lib/supabase/client";

export interface NormalizedImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface NormalizedVariant {
  id: string;
  sku: string | null;
  title: string;
  available: boolean;
  quantityAvailable: number;
  price: number;
  currencyCode: string;
  options: { name: string; value: string }[];
}

export interface NormalizedProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  category: string;
  rawProductType: string;
  tags: string[];
  materials: string[];
  images: NormalizedImage[];
  variants: NormalizedVariant[];
  minPrice: number;
  maxPrice: number;
  currencyCode: string;
  inStock: boolean;
  // Supabase products.created_at (ISO string) - powers the homepage
  // "New in the atelier" lane. Caveat: products carried over from the
  // Shopify migration share the import timestamp, so the lane's order
  // only becomes truly meaningful for products added after Sep 2026.
  createdAt: string;
}

// Same normalized taxonomy the migration wrote into products.category --
// kept here as the display list every filter/nav component reads.
export const DISPLAY_CATEGORIES = ["Dresses", "Tops", "Co-ord Sets"];

export const KNOWN_MATERIALS = [
  "linen",
  "crepe-silk",
  "chanderi-silk",
  "cotton",
  "modal-silk",
];

export const MATERIAL_GROUPS: { label: string; slugs: string[] }[] = [
  { label: "Linen", slugs: ["linen"] },
  { label: "Cotton", slugs: ["cotton"] },
  { label: "Silk", slugs: ["crepe-silk", "chanderi-silk", "modal-silk"] },
];

interface ProductRow {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  description_html: string | null;
  category: string;
  material: string | null;
  price_min: string | null;
  price_max: string | null;
  created_at: string;
  product_images: {
    url: string;
    alt_text: string | null;
    position: number;
  }[];
  product_variants: {
    id: string;
    title: string;
    sku: string | null;
    price: string;
    inventory_quantity: number;
    position: number;
  }[];
}

const PRODUCT_SELECT = `
  id, handle, title, description, description_html, category, material,
  price_min, price_max, created_at,
  product_images ( url, alt_text, position ),
  product_variants ( id, title, sku, price, inventory_quantity, position )
`;

// Photo folders live in public/collection/<folder>/. The Supabase import
// preserved the source order for the Alabaster kaftan, where the back view was
// first, so it leads with the front-facing local image instead.
//
// Oct 2026 photo audit: older listings had been dressed with look alike photos
// of other garments, so one dress could appear under two names. This table
// pins each listing to the folder that really shows its garment. Handles not
// listed here keep the images stored in Supabase.
const lookbook = (folder: string): string[] =>
  [
    "01-front-view.jpg",
    "02-three-quarter-front-view.jpg",
    "03-side-view.jpg",
    "04-back-view.jpg",
    "05-close-up-detail.jpg",
  ].map((f) => `/collection/${folder}/${f}`);

const numbered = (folder: string, count: number): string[] =>
  Array.from(
    { length: count },
    (_, i) => `/collection/${folder}/${String(i + 1).padStart(2, "0")}.jpg`,
  );

const PRODUCT_IMAGE_OVERRIDES: Record<string, string[]> = {
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

// Listings kept in the database but not shown until real photos exist.
const HIDDEN_HANDLES = new Set<string>(["lime-green-linen-co-ord-set"]);

// Display names changed after the audit (handles stay the same so links work).
const TITLE_OVERRIDES: Record<string, string> = {
  "the-saphire-flow-set": "Tile and Terra Set",
};

function normalizeRow(row: ProductRow): NormalizedProduct {
  const sourceImages = [...row.product_images]
    .sort((a, b) => a.position - b.position)
    .map((img) => ({
      url: img.url,
      altText: img.alt_text,
      width: 1024,
      height: 1536,
    }));
  const images = PRODUCT_IMAGE_OVERRIDES[row.handle]?.map((url) => ({
    url,
    altText: row.title,
    width: 1024,
    height: 1536,
  })) ?? sourceImages;

  const variants = [...row.product_variants]
    .sort((a, b) => a.position - b.position)
    .map((v) => ({
      id: v.id,
      sku: v.sku,
      title: v.title,
      available: v.inventory_quantity > 0,
      quantityAvailable: v.inventory_quantity,
      price: Number(v.price),
      currencyCode: "INR",
      options: [{ name: "Size", value: v.title }],
    }));

  return {
    id: row.id,
    title: TITLE_OVERRIDES[row.handle] ?? row.title,
    handle: row.handle,
    description: row.description ?? "",
    descriptionHtml: row.description_html ?? "",
    category: row.category,
    rawProductType: row.category,
    tags: row.material ? [row.material] : [],
    materials: row.material ? [row.material] : [],
    images,
    variants,
    minPrice: row.price_min !== null ? Number(row.price_min) : 0,
    maxPrice: row.price_max !== null ? Number(row.price_max) : 0,
    currencyCode: "INR",
    inStock: variants.some((v) => v.available),
    createdAt: row.created_at,
  };
}

export async function getCatalog(): Promise<NormalizedProduct[]> {
  const { data, error } = await supabaseCatalog
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .order("title");

  if (error) {
    throw new Error(`Supabase catalog query failed: ${error.message}`);
  }

  return (data as unknown as ProductRow[])
    .filter((row) => !HIDDEN_HANDLES.has(row.handle))
    .map(normalizeRow);
}

export async function getProductByHandle(
  handle: string,
): Promise<NormalizedProduct | null> {
  const { data, error } = await supabaseCatalog
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .eq("handle", handle)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase product query failed: ${error.message}`);
  }

  if (!data || HIDDEN_HANDLES.has(handle)) return null;
  return normalizeRow(data as unknown as ProductRow);
}
