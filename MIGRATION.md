# Full Shopify independence: status

Confirmed with Abhishek, 1 Sep 2026: this is now a full platform switch
(Option B in PLAN.md section 0), not the headless-with-Shopify-checkout
approach the current build was written against. Catalog and orders both
move to Supabase. Shopify goes away entirely, including the hosted
checkout the cart currently hands off to. Abhi runs everything day to day
(not Binita) via Supabase Studio directly -- no custom admin panel needed.

## Done

- `supabase/migrations/0001_init.sql` -- full schema: products,
  product_images, product_variants, orders, order_items. RLS on
  everywhere: catalog is public-read for `status = 'active'` rows only,
  orders/order_items have no public policies at all (service role only,
  every write happens server-side).
- `scripts/migrate-shopify-to-supabase.ts` -- pulls the live catalog
  through the existing `getCatalog()` (same data + reshoot image
  overrides the site already renders), upserts into Supabase by handle.
  Idempotent, safe to re-run.
- `package.json` -- added `@supabase/supabase-js`, `razorpay`, `tsx`, and
  a `migrate:catalog` script. Not yet installed (`npm install`) --
  do that wherever the real build runs (the C:\dev checkout), not in a
  disposable cloud sandbox.
- Supabase project created: org "Label AshB" (Free plan), project
  `labelashb`, ref `dlksfuelxcvgblmyaysh`, South Asia (Mumbai) region,
  Data API auto-expose off, automatic RLS on.

## Update (1 Sep 2026, later)

Supabase login issue cleared. Final project: Peel Manor House org (Pro),
project `labelashb`, ref `rodwlokcqawajsugxatp`, South Asia (Mumbai). The
earlier Free-org project (ref `dlksfuelxcvgblmyaysh`) is unused, can be
deleted whenever. `0001_init.sql` has been run against the Pro project --
all 5 tables (products, product_images, product_variants, orders,
order_items) confirmed live in Table Editor, RLS and policies applied.
`.env.local` on Abhi's machine (`C:\dev\LabelAshB-Migration-Shopify-To-StandardWebsite`)
updated with the correct variable names and this project's keys.

Next real blocker: the image hosting decision below, before running
`npm run migrate:catalog` for real.

## Blocked / pending

- **Supabase login**: a live Supabase-side incident (JWT rejection /
  degraded API gateway, tracked on status.supabase.com since 28 Aug 2026)
  is blocking dashboard login right now. Needed once it clears: grab the
  `anon` and `service_role` keys from Project Settings > API.
  Decided: stay on the Free org "Label AshB" for now, migrate this
  project into the Peel Manor House Pro org later once that account's
  login works again (separately broken with a NetworkError against
  auth.supabase.io -- also looks like the same incident, not a real
  permissions problem).
- **Razorpay**: keys depend on Binita, expected tomorrow. Nothing on the
  checkout/payment side can be built against real keys until then --
  test-mode keys unblock everything except the final live cutover.
- **Vercel deployment**: live at
  https://label-ash-b-standard-website.vercel.app/ -- confirmed loading,
  matches this repo. Assume it's connected to GitHub auto-deploy on
  push, not yet verified which branch/project settings.
- **Image hosting**: decided -- full self-host, zero Shopify dependency.
  Binita wants to close the Shopify store as soon as possible, so
  hotlinking `cdn.shopify.com` is not an option even short term.
  `supabase/migrations/0002_storage.sql` created a public
  `product-images` Storage bucket (already run). The migration script
  now downloads every Shopify CDN image and re-uploads it there before
  writing the row -- nothing in the database will point at
  cdn.shopify.com once it's run. Already-local reshoot images
  (`public/collection/...`) are left as-is, they were never a Shopify
  dependency.
- **DNS cutover**: labelashb.in nameservers currently point at Hostinger
  parking (`lunar.dns-parking.com` / `solar.dns-parking.com`), not live
  Shopify or Vercel yet. Needs explicit approval before touching, per
  standing rule -- not happening until the new site is fully built and
  QA'd.

## Next once Supabase access is back

1. Run `supabase/migrations/0001_init.sql` against the project.
2. Grab anon + service role keys, add to `.env.local` (never commit it --
   confirm it's in `.gitignore`, which it already is).
3. Run `npm run migrate:catalog` once the image hosting decision is made.
4. Start replacing `src/lib/shopify/*` call sites (cart, catalog, PDP,
   PLP) with Supabase queries -- `src/app/products/page.tsx`,
   `src/app/products/[handle]/page.tsx`, `src/components/cart/*`.
5. Build the Razorpay order-create + payment-verify + webhook route once
   test keys are in hand.
