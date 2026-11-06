// Regression tests for src/lib/shopify/description-text.ts -- the
// render-time grammar corrections applied by catalog.ts to every product
// description (Nov 6 2026 audit fixes). Plain node, no framework:
//   node scripts/test-description-patches.mjs
// (Node >= 23 strips the module's erasable TS types on import.)

import assert from "node:assert/strict";
import {
  DESCRIPTION_PATCHES,
  applyDescriptionPatches,
} from "../src/lib/shopify/description-text.ts";

let passed = 0;

// 1. Each audit error is corrected
{
  const cases = [
    ["The trouser in pure modal silk arries a bold botanical print.",
     "The trouser in pure modal silk carries a bold botanical print."],
    ["as these are naturally dyed clothes.Natural cotton and handblock prints require",
     "as these are naturally dyed clothes. Natural cotton and handblock prints require"],
    ["If washing at home wash separately in cold water",
     "If washing at home, wash separately in cold water"],
    ["use very mild detergent and wash separately which is important for Natural handblock prints and dark colours",
     "use very mild detergent and wash separately - this is important for natural handblock prints and dark colours"],
    ["with very mild detergent as these are naturally dyed clothes. Use mild detergent only. Do not bleach.",
     "with very mild detergent as these are naturally dyed clothes. Do not bleach."],
    ["The Saphire Flow Set pairs a hand-embroidered top with trousers.",
     "The Tile and Terra Set pairs a hand-embroidered top with trousers."],
  ];
  for (const [broken, fixed] of cases) {
    assert.equal(applyDescriptionPatches(broken), fixed, `unfixed: ${broken.slice(0, 50)}`);
    passed++;
  }
}

// 2. Idempotent: running twice changes nothing further
{
  const once = applyDescriptionPatches("If washing at home wash separately in cold water");
  assert.equal(applyDescriptionPatches(once), once);
  passed++;
}

// 3. Clean text passes through untouched (rose-broderie's legitimate
//    "Use mild detergent only." hand-wash line must survive)
{
  const clean = "Dry clean or gentle hand wash separately in cold water. Use mild detergent only. Do not bleach.";
  assert.equal(applyDescriptionPatches(clean), clean);
  passed++;
}

// 4. Null/undefined safety (catalog passes raw DB columns)
{
  assert.equal(applyDescriptionPatches(null), "");
  assert.equal(applyDescriptionPatches(undefined), "");
  assert.equal(applyDescriptionPatches(""), "");
  passed++;
}

// 5. HTML descriptions get the same corrections
{
  const html = "<p>The trouser in pure modal silk arries a bold botanical print.</p>";
  assert.ok(applyDescriptionPatches(html).includes("carries"));
  // "carries" contains "arries" as a substring, so assert on the phrase
  assert.ok(!applyDescriptionPatches(html).includes("silk arries"));
  passed++;
}

// 6. Table integrity: every patch is a sane exact-substring replace
{
  for (const { from, to } of DESCRIPTION_PATCHES) {
    assert.ok(from.length > 5, `suspiciously short pattern: ${from}`);
    assert.ok(from !== to, `no-op patch: ${from}`);
    assert.ok(!to.includes(from), `patch re-introduces its pattern: ${from}`);
  }
  passed++;
}

console.log(`test-description-patches: ${passed} groups passed`);
