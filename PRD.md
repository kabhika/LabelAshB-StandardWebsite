# PRD — Label AshB Website Migration

**Repo**: `C:\dev\LabelAshB-Migration-Shopify-To-StandardWebsite`
**Status**: Draft, pending Binita's confirmation on Section 1 decisions
**Owner**: Abhishek Sinha, Coralstone Services

---

## 1. Decisions requiring confirmation before build starts

| Decision | Recommendation | Why | Confirmed? |
|---|---|---|---|
| Migration architecture | Headless: Shopify backend + custom Next.js frontend | Keeps working payments/COD/tax/inventory, only replaces the storefront | ☐ |
| Domain | Keep `labelashb.in`, repoint DNS to Vercel | No brand/SEO disruption | ☐ |
| Draft product | Exclude "Midnight Marigold Co-ord Set" until Binita publishes it | Draft status is a deliberate Shopify state, respect it | ☐ |
| Image hosting | Stay on `cdn.shopify.com`, no re-hosting | Deviation from Coralstone default, reasoned in PLAN.md §2 | ☐ |

---

## 2. Goal

Replace the Shopify theme storefront at `labelashb.in` with a custom-built
Next.js site that is visibly, immediately different in quality from a
templated Shopify store — the kind of site other small fashion labels would
point to as a reference — while keeping the commerce backend (checkout,
inventory, India payment methods, order management) exactly as it is today,
because it currently works and rebuilding it is not the ask.

## 3. Non-goals

- Not rebuilding checkout, payments, COD, or tax handling
- Not migrating orders, customers, or historical sales data — Shopify admin
  stays the operational tool for that
- Not a multi-region or multi-currency site — INR only, matches current store
- Not adding new products or business lines as part of this project

## 4. Users

- **Shoppers**: primarily India-based, browsing and buying women's fashion
  (dresses, tops, co-ord sets) in the ₹1,500–₹9,000 range. Mobile-heavy
  traffic should be assumed until analytics say otherwise — no session data
  pulled yet, worth checking Shopify analytics before committing to a
  mobile-first layout assumption.
- **Binita** (store owner): manages inventory, pricing, and product content
  entirely through Shopify admin, same as today. The new frontend must not
  require her to learn a second content system for anything commerce-related.
- **Abhishek** (builder/maintainer): needs the codebase to stay legible for
  future changes, not a one-off flex build that's hard to touch six months in.

## 5. Functional requirements

### 5.1 Catalog

- Product listing page(s) reflecting live Shopify inventory via Storefront
  API, not a static snapshot
- Product detail page: full image gallery, all variants with real-time stock
  state, price, materials/fabric story (this store's descriptions lean
  heavily on fabric and colour narrative — preserve that voice, don't
  compress it into bullet specs)
- Size/variant selector must correctly represent 0-stock variants as
  unavailable, not hide them or crash — confirmed real data pattern, most
  products have exactly one in-stock size at any given time
- Category/type navigation from a normalized taxonomy (Dress, Tops, Co-ord
  Sets — collapse "outfit sets" and "Co-ord Set" into one category before
  this becomes user-facing navigation)
- Material/fabric filter (linen, chanderi silk, crepe silk, cotton, modal
  silk) — genuinely useful given how much the descriptions lean on fabric

### 5.2 Cart and checkout

- Cart drawer/page built on Storefront API cart mutations
- Checkout hands off to Shopify-hosted checkout (keeps COD, payment gateway,
  GST calculation working without rebuilding any of it)

### 5.3 Content pages

- Home: hero, featured products, brand story
- About / brand story
- Size guide
- Shipping, returns, privacy — pull from whatever exists in Shopify admin
  policies now, don't invent new legal copy
- Contact

### 5.4 Non-functional

- Lighthouse performance meaningfully better than the current Shopify theme
  — this is the actual "wow" mechanism, not just visual polish. Fast product
  pages on mobile India networks matter more than any animation.
- SSR or static generation for every page — no client-rendered shell serving
  empty HTML to crawlers (Coralstone Services' own failure log incident,
  don't repeat it here)
- Accessible: real alt text per product image pulled from Shopify (not
  keyword-stuffed), proper focus states, adequate contrast against the
  Studio Minimal monochrome palette

## 6. Design requirements

Direction: **Studio Minimal**, adapted with an accent hue sampled from actual
product photography (see PLAN.md §3), not the generic example palette.
Full detail in `PLAN.md` and `design-directions.md`.

Style tile required and must be approved before any content page is built.

## 7. Technical requirements

- Next.js (App Router), TypeScript, Tailwind v4, shadcn/ui
- Framer Motion for the scroll-driven reveals Studio Minimal calls for —
  used deliberately, not decoratively, per the direction's own rule
- Shopify Storefront API (GraphQL) for products, collections, cart
- Images via `next/image`, remote pattern for `cdn.shopify.com`
- Vercel hosting, deployment protection on until Phase 0 commercial gate
  clears
- All custom Tailwind tokens prefixed `labelashb-`, checked against Tailwind's
  built-in scale names before use — this exact bug (`--spacing-*` collision)
  cost a full session on Peel Manor House

## 8. Risks

- **Storefront API rate limits on Basic plan** at real traffic — unconfirmed,
  check before launch, not after
- **Fact drift between Shopify admin and any cached/static content** — mitigate
  by pulling commerce data live, never freezing it into the codebase
- **Data quality in the source catalog** (null SKUs, inconsistent type
  naming) will surface as bugs if not normalized deliberately in Phase 1,
  rather than patched reactively in Phase 4 when it's more expensive to fix
- **Scope creep into a full platform switch** mid-build — the Section 1
  architecture decision needs to be genuinely locked, not revisited
  informally three weeks in

## 9. Success criteria

- Every one of the 46 active products renders correctly, with correct stock
  state, sourced live from Shopify
- Checkout completes end to end through the real Shopify checkout flow with
  a live test order
- Lighthouse performance score improvement documented, before vs. after
- Binita can update a price or mark something out of stock in Shopify admin
  and see it reflected on the new site with no code change and no redeploy
- Site passes the site-factory preflight script clean before any client
  review link goes out
