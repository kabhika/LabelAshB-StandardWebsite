// Regression tests for src/lib/shopify/product-images.ts -- the image
// authority shared by the PDP, cart and order snapshot, added with the
// Crimson Tiles fix (Oct 31 2026). Plain node, no framework: run with
//   node scripts/test-product-images.mjs
// (Node >= 23 strips the module's erasable TS types on import.)

import assert from "node:assert/strict";
import {
  PRODUCT_IMAGE_OVERRIDES,
  authoritativeProductImage,
  authoritativeProductImages,
} from "../src/lib/shopify/product-images.ts";

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok - ${name}`);
  } catch (e) {
    console.error(`  FAIL - ${name}\n    ${e.message}`);
    process.exitCode = 1;
  }
}

// The production-shaped stale rows: a PINK dress photo at position 0 on
// the crimson product -- exactly what the live DB carries.
const PINK = "https://x.supabase.co/storage/v1/object/public/product-images/salmon-wildflower-ruffle-dress/0.jpg";
const staleCrimsonRows = [
  { url: PINK, alt_text: "wrong row", position: 0 },
  { url: PINK.replace("/0.jpg", "/1.jpg"), alt_text: "wrong row", position: 1 },
];

test("THE BUG: crimson tiles ignores stale pink DB rows, resolves override", () => {
  const img = authoritativeProductImage("the-crimson-tiles-linen-dress", staleCrimsonRows);
  assert.equal(img, "/collection/45-crimson-tiles-hand-block-cotton-dress/01.jpg");
  assert.notEqual(img, PINK);
});

test("override product with NO db rows still resolves", () => {
  const img = authoritativeProductImage("the-crimson-tiles-linen-dress", []);
  assert.ok(img?.startsWith("/collection/45-crimson-tiles-hand-block-cotton-dress/"));
});

test("non-override product uses DB rows in position order", () => {
  const rows = [
    { url: "b.jpg", position: 1 },
    { url: "a.jpg", position: 0 },
  ];
  assert.equal(authoritativeProductImage("some-other-product", rows), "a.jpg");
});

test("array order of DB rows does not matter, only position (catalog reorder invariance)", () => {
  const a = [
    { url: "a.jpg", position: 0 },
    { url: "b.jpg", position: 1 },
    { url: "c.jpg", position: 2 },
  ];
  const b = [a[2], a[0], a[1]];
  assert.deepEqual(
    authoritativeProductImages("x", a),
    authoritativeProductImages("x", b),
  );
});

test("missing position falls back to 0 ordering, not undefined sort", () => {
  const rows = [{ url: "n.jpg" }, { url: "m.jpg", position: 2 }];
  assert.equal(authoritativeProductImage("x", rows), "n.jpg");
});

test("no override, no rows -> null (neutral placeholder, never another product's photo)", () => {
  assert.equal(authoritativeProductImage("x", []), null);
  assert.equal(authoritativeProductImage("x", null), null);
  assert.equal(authoritativeProductImage(null, [{ url: "y.jpg", position: 0 }]), "y.jpg");
});

test("two different products keep distinct images (peach stays pink, crimson stays crimson)", () => {
  const crimson = authoritativeProductImage("the-crimson-tiles-linen-dress", staleCrimsonRows);
  const peach = authoritativeProductImage("salmon-wildflower-ruffle-dress", [{ url: PINK, position: 0 }]);
  assert.notEqual(crimson, peach);
  assert.equal(peach, PINK); // peach's own pink photo is CORRECT for peach
});

test("every override handle maps to repo-local /collection images (stable identifiers, not positions)", () => {
  for (const [handle, urls] of Object.entries(PRODUCT_IMAGE_OVERRIDES)) {
    assert.ok(urls.length > 0, `${handle} has images`);
    for (const u of urls) assert.ok(u.startsWith("/collection/"), `${handle}: ${u}`);
  }
});

test("azure override is the 4-view set (view-count regression guard)", () => {
  assert.equal(PRODUCT_IMAGE_OVERRIDES["azure-whisper-linen-top"].length, 4);
});

console.log(`\n${passed} assertions groups passed${process.exitCode ? " (WITH FAILURES)" : ""}`);
