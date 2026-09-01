// One time catalog migration: Shopify Storefront API -> Supabase.
//
// Reuses the exact same getCatalog() the live headless site already calls,
// so this migrates whatever the site currently shows (including the
// reshoot/presentation image overrides in src/data/product-reshoots.ts),
// not a raw unprocessed Shopify pull.
//
// Full independence: every image is downloaded and re-uploaded into the
// "product-images" Supabase Storage bucket (supabase/migrations/0002_storage.sql
// creates it). Nothing in the resulting database references cdn.shopify.com
// -- once this runs, the site has zero runtime dependency on Shopify for
// images, matching the decision to let Binita close the Shopify store.
// A handful of products already use locally-hosted reshoot images
// (public/collection/...) -- those are left as relative site paths,
// untouched, since they were never a Shopify dependency to begin with.
//
// Requires, in .env.local or the shell environment:
//   SHOPIFY_STORE_DOMAIN
//   SHOPIFY_STOREFRONT_ACCESS_TOKEN
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (service role, never the anon key -- this
//                                 script must bypass RLS to write)
//
// Run once, after supabase/migrations/0001_init.sql and 0002_storage.sql
// have been applied:
//   npx tsx scripts/migrate-shopify-to-supabase.ts
//
// Idempotent on product handle: re-running updates existing rows rather
// than duplicating them, so it is safe to re-run after fixing a data issue.
// Image re-uploads use upsert, so re-running does not create duplicate
// files in storage.

import { createClient } from "@supabase/supabase-js";
import { getCatalog, type NormalizedProduct } from "../src/lib/shopify/catalog";

const IMAGE_BUCKET = "product-images";

function extensionFromUrl(url: string): string {
  const path = new URL(url).pathname;
  const match = path.match(/\.([a-zA-Z0-9]+)$/);
  return (match?.[1] ?? "jpg").toLowerCase();
}

function contentTypeForExtension(ext: string): string {
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "image/jpeg";
  }
}

// Downloads a Shopify CDN image and re-uploads it to Supabase Storage,
// returning the new public URL. Leaves already-local paths (the reshoot
// images under public/collection/) untouched -- those aren't a Shopify
// dependency and re-hosting them would just be extra work for nothing.
async function selfHostImage(
  supabase: ReturnType<typeof createClient>,
  productHandle: string,
  index: number,
  url: string,
): Promise<string> {
  if (!url.includes("cdn.shopify.com")) {
    return url; // already local (reshoot image) or already self-hosted
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download image ${url}: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = extensionFromUrl(url);
  const storagePath = `${productHandle}/${index}.${ext}`;

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: contentTypeForExtension(ext),
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload ${storagePath}: ${error.message}`);
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars",
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Matches the draft-exclusion decision in PLAN.md / PRD.md section 1: draft
// products don't come back from the Storefront API at all, so this is only
// a safety net, not the primary filter.
function statusFor(product: NormalizedProduct): "active" | "draft" {
  return product.inStock || product.variants.length > 0 ? "active" : "draft";
}

async function migrateProduct(product: NormalizedProduct) {
  const status = statusFor(product);

  const { data: upserted, error: productError } = await supabase
    .from("products")
    .upsert(
      {
        handle: product.handle,
        title: product.title,
        description: product.description,
        description_html: product.descriptionHtml,
        category: product.category,
        material: product.materials[0] ?? null,
        status,
        price_min: product.minPrice,
        price_max: product.maxPrice,
        shopify_product_id: product.id,
      },
      { onConflict: "handle" },
    )
    .select("id")
    .single();

  if (productError || !upserted) {
    console.error(`FAILED product ${product.handle}:`, productError);
    return { handle: product.handle, ok: false };
  }

  const productId = upserted.id as string;

  // Replace images and variants wholesale on every run -- simplest correct
  // approach for a low-frequency migration script, avoids reconciling
  // position/order diffs.
  await supabase.from("product_images").delete().eq("product_id", productId);
  await supabase.from("product_variants").delete().eq("product_id", productId);

  if (product.images.length > 0) {
    const hostedImages: { url: string; alt_text: string | null; position: number }[] = [];
    for (let i = 0; i < product.images.length; i++) {
      const img = product.images[i];
      try {
        const hostedUrl = await selfHostImage(supabase, product.handle, i, img.url);
        hostedImages.push({ url: hostedUrl, alt_text: img.altText, position: i });
      } catch (err) {
        console.error(`  image ${i} failed (${product.handle}):`, err);
      }
    }

    if (hostedImages.length > 0) {
      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(hostedImages.map((img) => ({ ...img, product_id: productId })));
      if (imagesError) console.error(`  images error (${product.handle}):`, imagesError);
    }
  }

  if (product.variants.length > 0) {
    const { error: variantsError } = await supabase.from("product_variants").insert(
      product.variants.map((v, i) => ({
        product_id: productId,
        title: v.title,
        sku: v.sku,               // stays null where Shopify had null -- do not fabricate
        price: v.price,
        inventory_quantity: v.quantityAvailable,
        position: i,
        shopify_variant_id: v.id,
      })),
    );
    if (variantsError) console.error(`  variants error (${product.handle}):`, variantsError);
  }

  return { handle: product.handle, ok: true };
}

async function main() {
  console.log("Fetching live catalog from Shopify Storefront API...");
  const catalog = await getCatalog();
  console.log(`Got ${catalog.length} products. Migrating to Supabase...`);

  const results = [];
  for (const product of catalog) {
    results.push(await migrateProduct(product));
    process.stdout.write(".");
  }
  console.log("");

  const failed = results.filter((r) => !r.ok);
  console.log(`Done. ${results.length - failed.length}/${results.length} succeeded.`);
  if (failed.length > 0) {
    console.log("Failed handles:", failed.map((f) => f.handle).join(", "));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
