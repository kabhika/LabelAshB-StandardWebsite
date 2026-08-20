# Placeholder Policy — Structural Redesign (Vrajbhoomi IA Reference)

Section-by-section decision on what builds now with real Label AshB content,
what builds now with generic/stock content standing in for real assets, and
what gets skipped until real assets exist. Written before any component code
(Phase 0). Reference: PRODUCT.md for product truth, `_knowledge/facts.json`
for copy source of truth.

## Catalog reality check (live Storefront API, not assumed)

Pulled from `/api/catalog-debug` against the live catalog:

- **49 products total** — 23 in stock, 26 out of stock. More than half the
  catalog is currently unavailable; any section curating "featured" or
  "collection" products must filter to `inStock` the same way the homepage
  already does, or it will surface pieces a shopper can't buy.
- **3 categories, not 4+**: Dresses (21), Tops (15), Co-ord Sets (13). The
  IA reference's "4-tile category promo grid" row is conditioned on 4+
  categories existing — that condition is false here. Builds as a
  **3-tile grid**, not padded with a 4th invented category.
- **Materials**: linen (33), cotton (6), chanderi-silk (5), crepe-silk (2),
  modal-silk (1). The three silk tags combine to 8 products. A
  Linen / Cotton / Silk three-way fabric-collection split is well supported
  by the real distribution (linen dominant, cotton and combined-silk both
  present in double digits or close to it).
- **Image counts**: every product has 3–8 images (min 3, avg 4.4, zero
  products under 2). A hover-swap gallery on product cards (needs a primary
  + at least one alternate image) is supported catalog-wide — no per-product
  gap to design around.

## Section decisions

| Section | Asset status | Decision |
|---|---|---|
| Announcement bar | Real copy exists (shipping times, `_knowledge/facts.json`) | Build now, real content |
| Hero carousel | Real product photography (live Storefront API) | Build now, real content |
| Category tabs + product cards (hover-swap gallery, size pills) | Real photos, verified 3–8 images/product catalog-wide | Build now, real content |
| Secondary collection carousel (Linen / Cotton / Silk) | Real materials data, verified distribution above | Build now, real content — 3-way split (Linen / Cotton / Silk), not a 1:1 copy of Vrajbhoomi's own fabric groupings |
| 4-tile category promo grid | Only 3 real categories exist | Build now as a **3-tile grid** — real content, right-sized to the actual catalog, not padded to match the reference's tile count |
| Studio section | No studio photography yet | Build now with generic/stock imagery, full visual treatment, no placeholder labeling. This is atmospheric imagery (fabric, workspace, craft-adjacent), not a claim about a specific verifiable fact — swap to real footage when Binita sends it |
| **As Seen In / press** | No press mentions exist | **Omit entirely.** No section, no shell, no generic logo strip. A logo under "As Seen In" is a specific, checkable claim (this outlet covered us) that doesn't exist yet — there's no honest generic version of that claim. Revisit only once real press exists |
| **Testimonials carousel** | No customer quotes collected yet | Build the real carousel mechanics (motion, pagination, layout matching the IA reference) with placeholder quote content, and a small on-brand line acknowledging quotes are being collected — same type scale and palette as the rest of the site, not a warning banner. Swap to real quotes before launch |
| Why-us split section | Copy can be written now from confirmed brand positioning (PRODUCT.md) | Build now, real content |
| Process/material grid (Instagram-style) | No process photography yet | Build now with generic/stock imagery, full visual treatment, no placeholder labeling — same reasoning as Studio section (atmospheric, not a specific claim) |
| Newsletter signup | Straightforward | Build now, real content |
| Footer + WhatsApp float | Real contact details exist (`_knowledge/facts.json`) | Build now, real content |

## Why press and testimonials are treated differently from studio/process imagery

Generic stock imagery of fabric, a workspace, or hands at work makes no
specific claim a visitor could check and find false — it's mood, not
assertion. An "As Seen In" logo and a customer testimonial are different in
kind: they assert a specific fact (this outlet wrote about us / this person
bought from us and said this) that is either true or fabricated, with no
honest middle ground. That's why press is omitted rather than stood in for,
and why testimonials get real carousel mechanics plus an honest label rather
than content presented as genuine.

## Pre-launch checklist (do not let this drift)

- [ ] Real press logos, or remove the section permanently if none materialize
- [ ] Real customer testimonials, remove the "quotes coming soon" label once real quotes are in
- [ ] Real studio photography swapped in
- [ ] Real process/material photography swapped in
