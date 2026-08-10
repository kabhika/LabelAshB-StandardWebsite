# Label AshB — Shopify to Standard Website: Migration Plan

Repo: `C:\dev\LabelAshB-Migration-Shopify-To-StandardWebsite`
Source: `labelashb.in` (Shopify, Basic plan, INR, IST, India)
Client contact: binita.rai@gmail.com

---

## 0. The one decision that changes everything downstream

You haven't picked the migration type yet (asked earlier, not answered). I'm
picking one so this plan is concrete, and I'm flagging it clearly so you can
override it before anything gets built.

**Recommended: headless.** Keep Shopify as the commerce backend (checkout,
payments, COD, inventory, India tax config already live there). Build a fully
custom Next.js frontend against Shopify's Storefront API. The site looks
nothing like a Shopify theme, reads as "a standard website," but you are not
rebuilding payment gateways, GST handling, COD logistics and inventory sync
from zero for a 47-SKU catalog that already works.

Why not full platform switch: rebuilding checkout, payments and COD for an
active store selling real inventory is a multi-week project with real business
risk (a broken checkout costs sales immediately), and nothing in what you've
described needs Shopify gone entirely, only needs Shopify's storefront gone.

Why not content-only: you have live inventory across 47 products and multiple
size variants per product. Turning that into static marketing pages with no
cart throws away working commerce infrastructure and adds a manual step
(enquiry, phone) to something that already converts online.

If you want full platform switch instead, say so before Phase 3. Cost and
timeline both change substantially, per the site-factory operating rules.

---

## 1. What's actually in the Shopify store right now

Pulled live via the Shopify MCP connector, not scraped:

- **47 products**, 46 active, 1 draft ("Midnight Marigold Co-ord Set")
- **Types**: Dress, Tops, outfit sets, Co-ord Set — inconsistent casing/naming
  across products, needs normalizing into one taxonomy before it becomes site
  navigation
- **Price range**: ₹1,499 to ₹8,990
- **Materials as a real design axis**: linen, chanderi silk, crepe silk,
  cotton, modal silk — this is a strong candidate for filtering/storytelling,
  not just a tag
- **Variants**: mostly S/M/L/XL/2XL, a few with only "Default Title"
- **Data quality issues to fix during migration, not after**:
  - Several variants have `sku: null` (e.g. Crimson Grid Sleeveless Top, The
    Saphire Flow Set) — fine for Shopify, will break any SKU-keyed logic on
    the new site if not handled
  - Most variants show `inventoryQuantity: 0` for non-primary sizes — real
    stock state, not a bug, but the new PDP needs to handle "in stock in one
    size only" gracefully rather than looking broken
  - Images are all on `cdn.shopify.com`, one per product in this pull (product
    detail pages likely have more per product, worth a second pass to confirm
    gallery counts)

None of this blocks starting. It does mean Phase 1 below is "wire up the live
API and look at what comes back," not "manually copy 47 rows into a JSON file."

---

## 2. Why headless changes the failure-log lessons that apply here

Coralstone's own failure log has two rules that would normally apply and
don't, exactly, in this shape:

- **"Self host every image"** (Warm Market rule, from the Green Farm Products
  incident where images hotlinked from a lapsed personal domain died). Shopify
  CDN is not a lapsed personal domain, it's actively managed infrastructure
  for the same business, same account, same person maintaining it. Re-hosting
  47 products' worth of imagery is real work for no risk reduction. **Deviation,
  reasoned**: images stay on `cdn.shopify.com`, added to
  `next.config`'s remote patterns. If Label AshB ever leaves Shopify entirely,
  this becomes a real migration task, not before.
- **`facts.json` as single source of truth** (Sydney Movers fact-drift rule).
  Still applies, but the "facts" here are mostly live commerce data (price,
  stock, title, description), which should come from the Storefront API at
  request time, not be frozen into a JSON file that goes stale the moment
  Binita changes a price in Shopify admin. `facts.json` still holds the
  non-commerce facts: brand story, founding info, size guide copy, contact
  details, policies.

Everything else in the failure log applies as written: git first, `.gitignore`
checked before first commit, no claimed-done without `npm run build` and a
live fetch, one style tile before pages, batch feedback.

---

## 3. Design direction

**Studio Minimal** (direction 7), the primary recommendation for fashion in
the site-factory register, and not yet used by any Coralstone client — Peel
Manor House has Editorial Heritage, the closest overlap risk, and Studio
Minimal reads completely differently (monochrome ink/ground vs. burgundy/ivory
serif).

Adapted per the direction's own rule (sample the real hex, don't eyeball it):
accent colour pulled from the actual product palette rather than the generic
`#D6FF4B` example in the direction doc. Candidates from the live catalog: the
sage green of Meadow Whisper, the deep indigo of The Indigo Swallow, or the
terracotta of Mesa Block. Pick one during the style tile step, don't guess now.

Type: one family at extreme size contrast (Neue Montreal, General Sans, or
Instrument Sans per the direction). Product photography carries the site,
minimal chrome around it.

---

## 4. Phases

Following the site-factory nine-phase pipeline, adapted for a migration
instead of a greenfield build.

| Phase | What | Exit gate |
|---|---|---|
| 0 | Commercial + migration type confirmed | Scope agreed with Binita, migration type locked |
| 1 | Live data layer | Storefront API wired, product/collection query returns real catalog, taxonomy normalized |
| 2 | Direction lock | Style tile approved, accent hue picked from real product photography |
| 3 | Scaffold | Clean Next.js build, private repo, Vercel connected, protection on |
| 4 | Content build | Home, PLP, PDP, About, size guide, policies — all reading from live Storefront API + facts.json |
| 5 | Cart + checkout | Cart drawer, Storefront API checkout handoff to Shopify-hosted checkout (keeps COD/payment/tax working) |
| 6 | Discovery layer | Canonicals, sitemap, product schema (Offer/AggregateOffer), OG images per product |
| 7 | QA | Preflight, visual smoke at 3 breakpoints, stock-edge-case check (0-stock variants, draft products excluded) |
| 8 | Client review | Batched feedback with Binita, one pass |
| 9 | Handover | Storefront API token ownership, Vercel + domain handover, build log |

This repo already has graphify wired (claude install + hook install done).
Re-run `graphify . --code-only` after Phase 3 scaffold lands, it'll track
coverage as pages get built against the 47-product catalog.

---

## 5. Open questions for Binita, before Phase 0 closes

- Confirm headless approach (Shopify stays as backend) vs. full switch
- Domain: keep `labelashb.in` or does DNS move to point at Vercel
- Is `labelashb.in` currently on a paid Shopify plan that includes Storefront
  API access at the request volume a live site needs — Basic plan supports it,
  worth confirming rate limits aren't a problem at scale
- What happens to the draft product (Midnight Marigold Co-ord Set) — publish
  before migration or leave out of the new site until ready
