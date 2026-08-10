# Label AshB build prompt — paste into Claude Code from repo root

Repo root: `C:\dev\LabelAshB-Migration-Shopify-To-StandardWebsite`

Read this whole prompt before starting. Read `PRD.md` and `PLAN.md` in this
repo before writing any code. Read `_knowledge/facts.json` once it exists
(Phase 1 creates it) — that file holds every non-commerce business fact, and
nothing outside it gets hardcoded.

You are running six phases in sequence, autonomously, without stopping to ask
whether to continue. But "don't stop" does not mean "don't verify." Each
phase ends with a hard gate: run the verification commands yourself, read the
actual output, and only move to the next phase if the gate passes. If a gate
fails, fix the failure and re-run the gate — do not move on and do not mark
the phase done in your own narration until the command output confirms it.
This exact failure mode (work claimed done, verification showing nothing was
done) is the single most expensive mistake on past Coralstone projects. Do
not repeat it here.

At the very end, produce one final report covering all six phases together,
per the Final Report section below.

---

## Phase 1 — Live data layer

1. Confirm `.gitignore` covers `node_modules`, `.next`, `.env*` before
   anything else touches the repo.
2. Create `_knowledge/facts.json` for non-commerce facts only: brand name,
   founding story, contact email, size guide copy, shipping/returns/privacy
   policy text (pull from Shopify admin policies if reachable via the
   connected Shopify tools, otherwise placeholder-token it and log to
   `_knowledge/placeholders.md`).
3. Set up a Shopify Storefront API client (separate from the Admin API used
   during planning). Confirm the storefront access token and API version.
4. Write and test a query that returns the full product catalog: title,
   handle, description, price, images, variants with SKU and stock, product
   type/tags.
5. Normalize product taxonomy in code: collapse "outfit sets" and "Co-ord
   Set" into a single category. Do not edit source data in Shopify, do this
   mapping in the frontend.
6. Handle null SKUs and 0-stock variants explicitly — these are real states
   in the live data, not edge cases to crash on.

GATE — do not proceed until all of these pass:
- `npm run build` succeeds
- A test script or route prints the full normalized catalog with a count
  matching what's in Shopify (46 active products expected, draft excluded)
- `git status --short` shows the expected new files only

---

## Phase 2 — Scaffold and design system

1. Design direction: Studio Minimal. Sample the accent hex from actual
   product photography (see PLAN.md §3 for candidates) rather than guessing.
2. Define all tokens as CSS variables in `src/app/globals.css` via Tailwind
   v4 `@theme`. Prefix every custom token `labelashb-`. Do not add a bare
   `--spacing-*` key — it collides with the scale backing `max-w-*` and
   silently breaks widths sitewide, this exact bug already cost a full
   session on a past project.
3. Set up Framer Motion for scroll-driven reveals per the Studio Minimal
   motion budget — deliberate, not decorative, no reveal without a reason.
4. Build a single style tile page at `/_style`: palette with token names,
   type scale at real sizes, all button states, one product card component,
   one form field with an error state, one hero treatment. Build nothing
   else yet.

GATE:
- `npm run build` succeeds
- The `@theme` block, pasted in full, in the report
- `git status --short` output
- Confirm zero hardcoded hex values anywhere outside the token block —
  search the diff, don't assume

---

## Phase 3 — Catalog pages

1. Build: home, product listing page(s) with category and material filters,
   product detail page, about, size guide, shipping/returns/privacy,
   contact.
2. All commerce data (price, stock, images, description) comes live from the
   Storefront API query built in Phase 1. All non-commerce facts come from
   `facts.json`. No hardcoded product data anywhere.
3. Every product image gets real alt text sourced from the product data, not
   a generic keyword.
4. `next.config` remote pattern for `cdn.shopify.com` only — no other
   external image hosts.
5. Any animated/revealed text renders its final text in the server-rendered
   HTML and animates only on the client. Check this specifically — an empty
   initial value produces an empty heading in SSR output, invisible in dev
   but real in production.
6. Explicit `{" "}` anywhere a JSX expression sits directly next to a word.
7. Exactly one `<h1>` per page.

GATE:
- `npm run build` succeeds
- For each route built, fetch the rendered HTML and report the actual `<h1>`
  text as it appears in output, not what you intended it to be
- `git status --short --stat`

---

## Phase 4 — Cart and checkout

1. Cart state via Storefront API cart mutations, not client-only state that
   forgets itself on refresh.
2. Cart drawer or page, add/remove/update quantity, correctly blocking
   0-stock variants from being added.
3. Checkout button hands off to the real Shopify-hosted checkout URL
   returned by the Storefront API cart — do not attempt to rebuild checkout,
   payment, COD, or tax calculation.
4. Run one live test: add a real product to cart, reach the Shopify checkout
   page, confirm the cart contents match what was added.

GATE:
- `npm run build` succeeds
- Screenshot or HTML confirmation that the live test checkout page shows the
  correct product and price
- `git status --short`

---

## Phase 5 — Discovery layer

1. `metadataBase` in `src/app/layout.tsx`.
2. Self-referencing canonical on every route via `alternates.canonical`.
3. Unique title per route — if `title.template` appends the brand name, the
   page-level title must be the bare page name only, check this specifically,
   a doubled suffix has shipped before.
4. Unique meta description per route, 70–160 characters.
5. `src/app/robots.ts` and `src/app/sitemap.ts`, sitemap including every
   product route dynamically from the live catalog.
6. One shared `src/components/shared/JsonLd.tsx`, used everywhere schema is
   needed. Product schema (`Product` + `Offer`/`AggregateOffer`) on every
   PDP, `BreadcrumbList` on every non-home route.
7. OG image per product where available, sensible sitewide default
   otherwise.

GATE:
- `npm run build` succeeds
- Full JSON-LD for one product page and the home page, pasted raw
- `git status --short`

---

## Phase 6 — QA and preflight

1. Run the preflight script:
   ```powershell
   python C:\Users\abhi1\.claude\skills\coralstone-site-factory\scripts\preflight.py `
     --repo C:\dev\LabelAshB-Migration-Shopify-To-StandardWebsite `
     --base <vercel-preview-url> `
     --routes / /products /about /contact
   ```
2. Fix everything it flags. Re-run until clean.
3. Visual smoke check at 3 breakpoints (mobile, tablet, desktop) — describe
   what you actually see, not what should be there.
4. Confirm the string `[[` does not appear anywhere in built output —
   catches any placeholder token that survived to production.
5. Confirm the draft product (Midnight Marigold Co-ord Set) does not appear
   anywhere on the live site.

GATE:
- Preflight output, clean
- Confirmation the `[[` check returned nothing
- Confirmation the draft product is absent

---

## Final report

After all six phases and gates pass, produce one report with:
- `git log --oneline -20`
- `git diff <first commit>..HEAD --stat`
- Final `npm run build` output
- The full route list with, for each, h1 text, title tag, meta description,
  and canonical target
- Any placeholder tokens still open in `_knowledge/placeholders.md`
- Any decision from PRD.md Section 1 that is still unconfirmed and blocking
  a real launch (domain cutover, Storefront API rate limit check on Basic
  plan)

Do not summarize from memory at any point in this process. Every claim in
every gate and in the final report is backed by command output you actually
ran in that turn.
