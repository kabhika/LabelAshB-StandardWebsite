// Local-only PostgREST-shaped mock so the Next.js dev server can render
// the site (and reproduce the Crimson Tiles cart-image bug) without real
// Supabase credentials. Serves:
//   /rest/v1/products         -> catalog rows (PDP + homepage derivation)
//   /rest/v1/product_variants -> cart/buildCart rows with NESTED products
//                                and product_images
//
// The reproduction: "the-crimson-tiles-linen-dress" is an override
// product (catalog.ts PRODUCT_IMAGE_OVERRIDES -> correct crimson photos
// in /collection/45-...), but its DATABASE product_images rows - the
// source buildCart and create-order used - carry a WRONG pink-dress
// photo at position 0, exactly like the live import does. Peach
// Wildflower keeps its own (pink) rows so two-product carts are testable.
// Run: node scripts/mock-supabase.mjs   (127.0.0.1:54321)
import { createServer } from "node:http";

const CRIMSON_OVERRIDE_IMAGES = [
  "/collection/45-crimson-tiles-hand-block-cotton-dress/01.jpg",
  "/collection/45-crimson-tiles-hand-block-cotton-dress/02.jpg",
];

// The stale, WRONG rows as they exist in production for crimson tiles:
// a pink dress photo at position 0.
const CRIMSON_STALE_DB_IMAGES = [
  { url: "/collection/16-pink-striped-fringe-a-line-dress/01-front-view.jpg", alt_text: "Pink dress (wrong row)", position: 0 },
  { url: "/collection/16-pink-striped-fringe-a-line-dress/04-back-view.jpg", alt_text: "Pink dress (wrong row)", position: 1 },
];

const PEACH_DB_IMAGES = [
  { url: "/collection/16-pink-striped-fringe-a-line-dress/01-front-view.jpg", alt_text: "Peach Wildflower front", position: 0 },
];

function product(id, handle, title, category, material, images, price) {
  return {
    id, handle, title, description: "mock", description_html: "<p>mock</p>",
    category, material, price_min: price, price_max: price,
    created_at: "2026-10-01T00:00:00Z", status: "active",
    product_images: images,
  };
}

function variant(id, title, sku, price, qty, product, position) {
  return {
    id, title, sku, price: String(price), inventory_quantity: qty,
    position, product_id: product.id,
    products: { id: product.id, title: product.title, handle: product.handle, status: product.status, product_images: product.product_images },
  };
}

const CRIMSON = product("p-crimson", "the-crimson-tiles-linen-dress", "Crimson Tiles Hand Block Cotton Dress", "Dresses", "cotton", CRIMSON_STALE_DB_IMAGES, 1800);
const PEACH = product("p-peach", "salmon-wildflower-ruffle-dress", "Peaches & Wildflowers Ruffle Dress", "Dresses", "linen", PEACH_DB_IMAGES, 2600);
const AZURE = product("p-azure", "azure-whisper-linen-top", "Azure Whisper Linen Top", "Tops", "linen", [{ url: "/collection/08-mint-butterfly-a-line-dress/01-front-view.jpg", alt_text: "front", position: 0 }], 3399);

// NOTE: the catalog rows use the OVERRIDE images for crimson (as the PDP
// shows them via PRODUCT_IMAGE_OVERRIDES); the variant join embeds the
// STALE rows, mirroring the two different sources the bug lives between.
const CATALOG = [
  { ...CRIMSON, product_images: CRIMSON_OVERRIDE_IMAGES.map((url, i) => ({ url, alt_text: "Crimson Tiles", position: i })) },
  { ...PEACH },
  AZURE,
].map((p) => ({
  ...p,
  product_variants: p.handle === "the-crimson-tiles-linen-dress"
    ? [
        { id: "v-crimson-s", title: "S", sku: "CT-S", price: 1800, inventory_quantity: 2, position: 0 },
        { id: "v-crimson-m", title: "M", sku: "CT-M", price: 1800, inventory_quantity: 2, position: 1 },
        { id: "v-crimson-l", title: "L", sku: "CT-L", price: 1800, inventory_quantity: 2, position: 2 },
        { id: "v-crimson-xl", title: "XL", sku: "CT-XL", price: 1800, inventory_quantity: 3, position: 3 },
      ]
    : p.handle === "salmon-wildflower-ruffle-dress"
      ? [
          { id: "v-peach-l", title: "L", sku: "PW-L", price: 2600, inventory_quantity: 4, position: 0 },
          { id: "v-peach-xl", title: "XL", sku: "PW-XL", price: 2600, inventory_quantity: 4, position: 1 },
        ]
      : [
          { id: "v-azure-s", title: "S", sku: "AW-S", price: 3399, inventory_quantity: 5, position: 0 },
        ],
}));

const VARIANTS = CATALOG.flatMap((p) =>
  p.product_variants.map((v, i) => {
    const base = p.handle === "the-crimson-tiles-linen-dress" ? CRIMSON : p.handle === "salmon-wildflower-ruffle-dress" ? PEACH : AZURE;
    return variant(v.id, v.title, v.sku, v.price, v.inventory_quantity, base, i);
  }),
);

createServer((req, res) => {
  const json = (body, status = 200, extraHeaders = {}) => {
    res.writeHead(status, {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      ...extraHeaders,
    });
    res.end(body === null ? "null" : JSON.stringify(body));
  };
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "*",
      "access-control-allow-methods": "*",
    });
    res.end();
    return;
  }
  const url = req.url ?? "";
  const u = new URL(url, "http://x");
  const wantsSingle = (req.headers.accept ?? "").includes("vnd.pgrst.object");
  const rows = (table) => {
    let list = table === "product_variants" ? VARIANTS : CATALOG;
    const handle = u.searchParams.get("handle");
    if (handle) {
      const m = handle.match(/^eq\.(.*)$/);
      if (m) list = list.filter((r) => r.handle === m[1] || r.products?.handle === m[1]);
    }
    return list;
  };
  if (url.startsWith("/rest/v1/product_variants") || url.startsWith("/rest/v1/products")) {
    const table = url.startsWith("/rest/v1/product_variants") ? "product_variants" : "products";
    const list = rows(table);
    return wantsSingle ? json(list[0] ?? null, 200, { "content-type": "application/vnd.pgrst.object+json" }) : json(list);
  }
  if (url.startsWith("/auth/v1/user")) return json(null);
  if (url.startsWith("/rest/v1/")) return json([]);
  json({});
}).listen(54321, "127.0.0.1", () => console.log("mock supabase on http://127.0.0.1:54321"));
