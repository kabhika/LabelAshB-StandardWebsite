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
import {
  PRODUCT_IMAGE_OVERRIDES,
  authoritativeProductImages,
} from "@/lib/shopify/product-images";

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

// Product gallery images resolve through the shared, unit-tested module
// src/lib/shopify/product-images.ts (the Oct 2026 photo audit note and the
// full override table live there) so the PDP, cart and order snapshot all
// derive from ONE authority - see that file for the Crimson Tiles story.

// Listings kept in the database but not shown until real photos exist.
const HIDDEN_HANDLES = new Set<string>(["lime-green-linen-co-ord-set"]);

// Display names changed after the audit (handles stay the same so links work).
const TITLE_OVERRIDES: Record<string, string> = {
  "the-saphire-flow-set": "Tile and Terra Set",
};

function normalizeRow(row: ProductRow): NormalizedProduct {
  // One image authority for PDP, cart and order snapshot alike:
  // overrides (whose URLs are repo-local) or the DB rows in position
  // order. DB alt text is preserved by URL match on the DB path.
  const dbAltByUrl = new Map(
    row.product_images.map((img) => [img.url, img.alt_text]),
  );
  const isOverride = Boolean(PRODUCT_IMAGE_OVERRIDES[row.handle]);
  const images = authoritativeProductImages(row.handle, row.product_images).map(
    (url) => ({
      url,
      altText: isOverride ? row.title : (dbAltByUrl.get(url) ?? row.title),
      width: 1024,
      height: 1536,
    }),
  );

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
