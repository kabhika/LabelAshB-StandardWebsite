// Audit every live product: which gallery source serves its images
// (override table vs raw Supabase product_images rows), whether the lead
// image resolves, and which are dresses. Output: audit-dresses.json.
import { writeFileSync } from "node:fs";

const BASE = "https://www.labelashb.in";

// handles pinned by the repo's override table (src/lib/shopify/product-images.ts)
const OVERRIDES = new Set([
  "azure-whisper-linen-top", "alabaster-breeze-kaftan", "olive-grove-dress",
  "the-crimson-tiles-linen-dress", "the-midnight-botanical-kaftan-set",
  "the-regal-amethyst-co-ord-set", "orchid-sheesha-top",
  "the-mesa-block-linen-tunic", "the-ivory-garden-embroidered-dress",
  "magenta-reverie", "rani-linen-shirt", "the-folk-tale-linen-shirt",
]);

const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const handles = [...xml.matchAll(/\/products\/([a-z0-9-]+)<\/loc>/g)].map((m) => m[1]);
console.log(`${handles.length} product handles`);

const products = [];
for (const h of handles) {
  try {
    const res = await fetch(`${BASE}/products/${h}`, { redirect: "follow" });
    const html = await res.text();
    const title =
      html.match(/<title>([^|<]+)\|/)?.[1]?.trim() ??
      html.match(/og:title" content="([^"]+)"/)?.[1] ?? h;
    // URLs appear inside JSON payloads with escaped quotes (\"...jpg\") --
    // strip any trailing escape backslash so HEAD checks hit the real URL.
    const og = html.match(/og:image" content="([^"]+)"/)?.[1]?.replace(/[\s\\]+$/, "") ?? null;
    const gallery = [...new Set(
      [...html.matchAll(/\/collection\/[A-Za-z0-9\-_.%]+\.jpg/g)].map((m) => m[0]),
    )];
    const supabaseImgs = [...new Set(
      [...html.matchAll(/https:\/\/[a-z0-9]+\.supabase\.co\/storage\/[^"&?]*/g)]
        .map((m) => m[0].replace(/[\s\\]+$/, "")),
    )];
    const isOverride = OVERRIDES.has(h);
    const lead = og && og.includes("/collection/") ? og.split("?")[0] : gallery[0] ?? supabaseImgs[0] ?? null;
    products.push({
      handle: h,
      title,
      overridePinned: isOverride,
      source: isOverride ? "override-table" : "db-rows",
      leadImage: lead,
      galleryCount: gallery.length + supabaseImgs.length,
      gallerySample: gallery.slice(0, 2).concat(supabaseImgs.slice(0, 2)),
    });
  } catch (e) {
    products.push({ handle: h, error: e.message });
  }
}

// HEAD-check every lead image
for (const p of products) {
  if (!p.leadImage) { p.leadStatus = "none"; continue; }
  try {
    const url = p.leadImage.startsWith("http") ? p.leadImage : BASE + p.leadImage;
    const r = await fetch(url, { method: "HEAD" });
    p.leadStatus = String(r.status);
  } catch (e) {
    p.leadStatus = "err:" + e.message.slice(0, 40);
  }
}

writeFileSync("audit-dresses.json", JSON.stringify(products, null, 2));
const dresses = products.filter((p) => /dress|a-line|halter|maxi|midi|kaftan/i.test(p.title) || /dress/i.test(p.handle));
console.log(`\nDRESSES (${dresses.length}):`);
for (const d of dresses) {
  console.log(`${d.leadStatus === "200" ? "ok " : d.leadStatus.padEnd(4)} | ${d.source.padEnd(14)} | ${d.handle} (${d.title})`);
}
const bad = products.filter((p) => p.leadStatus !== "200");
console.log(`\nnon-200 leads: ${bad.length}`);
for (const b of bad) console.log(`  ${b.handle}: ${b.leadStatus}`);
