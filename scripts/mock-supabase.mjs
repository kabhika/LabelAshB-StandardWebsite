// Local-only PostgREST-shaped mock so the Next.js dev server can render
// the header (and pages) without real Supabase credentials. The anon key
// is a dummy; supabase-js just needs a parseable value. Serves:
//   GET /rest/v1/products*  -> three fake rows (Dresses/Tops/Co-ord Sets,
//                              Linen/Cotton materials) so the header's
//                              Categories and Collections dropdowns
//                              populate through the real derivation path.
//   anything else           -> [] (or auth user null)
// Run: node scripts/mock-supabase.mjs   (127.0.0.1:54321)
import { createServer } from "node:http";

const PRODUCTS = [
  {
    id: "p1", handle: "mock-azure-top", title: "Mock Azure Top",
    description: "mock", description_html: "<p>mock</p>",
    category: "Tops", material: "linen", price_min: 1000, price_max: 1000,
    created_at: "2026-10-01T00:00:00Z", status: "active",
    product_images: [
      { url: "/collection/21-azure-whisper-linen-top/01.jpg", alt_text: "front", position: 0 },
    ],
    product_variants: [
      { id: "v1", title: "S", sku: "S1", price: 1000, inventory_quantity: 5, position: 0 },
    ],
  },
  {
    id: "p2", handle: "mock-lavender-dress", title: "Mock Lavender Dress",
    description: "mock", description_html: "<p>mock</p>",
    category: "Dresses", material: "linen", price_min: 2000, price_max: 2000,
    created_at: "2026-10-02T00:00:00Z", status: "active",
    product_images: [
      { url: "/collection/22-lavender-cascade-linen-dress/01.jpg", alt_text: "front", position: 0 },
    ],
    product_variants: [
      { id: "v2", title: "M", sku: "M1", price: 2000, inventory_quantity: 3, position: 0 },
    ],
  },
  {
    id: "p3", handle: "mock-cotton-set", title: "Mock Cotton Set",
    description: "mock", description_html: "<p>mock</p>",
    category: "Co-ord Sets", material: "cotton", price_min: 3000, price_max: 3000,
    created_at: "2026-10-03T00:00:00Z", status: "active",
    product_images: [
      { url: "/collection/40-folk-tale-linen-co-ord-set/01.jpg", alt_text: "front", position: 0 },
    ],
    product_variants: [
      { id: "v3", title: "L", sku: "L1", price: 3000, inventory_quantity: 2, position: 0 },
    ],
  },
];

createServer((req, res) => {
  const json = (body, status = 200) => {
    res.writeHead(status, {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    });
    res.end(JSON.stringify(body));
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
  if (url.startsWith("/rest/v1/products")) return json(PRODUCTS);
  if (url.startsWith("/auth/v1/user")) return json(null);
  if (url.startsWith("/rest/v1/")) return json([]);
  json({});
}).listen(54321, "127.0.0.1", () => console.log("mock supabase on http://127.0.0.1:54321"));
