# New Collection - Shopify import kit

Goal: the 18 garments currently shown as a lookbook (`/collection`, local
images + names/descriptions in `src/data/new-collection.ts`) become real,
purchasable products. The site's catalog is headless - it reads products,
prices, and stock live from the Shopify Storefront API - so until these
exist in Shopify admin they can only be browsed and enquired about, not
bought.

## What's in this folder

- `new-collection-products.csv` - 18 products x 5 images each, with
  handles, titles, descriptions (HTML body), and category Types already
  filled in. Prices and inventory are intentionally BLANK.

## Before importing - three things only you can decide

1. **Prices** - fill the `Variant Price` column (INR) on each product's
   first row. The site renders `en-IN` with no decimals, so plain integers
   (e.g. `2990`) are enough.
2. **Sizes** - the CSV uses a single `Default Title` variant. If pieces
   come in sizes (XS-XL), either add an `Option1 Name` of `Size` with one
   row per size, or edit variants in admin after import.
3. **Publish state** - rows are set `Published=TRUE`. Set FALSE if you'd
   rather proof them as drafts first.

## Image URLs - the one edit this file needs

Every `Image Src` points at `https://YOUR-DEPLOYED-SITE-DOMAIN/
collection/<slug>/01-front-view.jpg` etc. These are the optimized JPGs in
`public/collection/`. Find-and-replace the placeholder with the deployed
site's real domain once the site is live (the images must be publicly
reachable - Shopify fetches and re-hosts them on its CDN during import;
the originals can go away later).

## Importing

Shopify admin > Products > Import > choose the CSV > preview > confirm.
(Admin > Products > Import; "Overwrite any current products that have the
same handle" is safe here - these handles are new and don't collide with
the existing 49.)

## After import

- The standalone site picks the products up automatically (catalog
  revalidates every 60s) - they'll appear in `/products`, category
  filters, and the homepage shop carousel with prices and add-to-cart.
- The `/collection` lookbook stays as the editorial presentation of the
  season; retire it whenever you like by deleting `src/app/collection/`
  and the `src/data/new-collection.ts` references.

## Honest caveats (from new-images/README.md)

- The photography was produced with generative image editing. Review each
  garment's images against the physical piece before publishing -
  construction details on unseen angles were kept deliberately simple.
- Descriptions in the CSV state only what is visible in the images
  (colour, silhouette, motif, length). Fabric/composition claims are
  absent on purpose - add them from the physical garment's spec, not from
  the images.
- Garments 15 and 16 were generated primarily from back-view references;
  their fronts are conservative reconstructions. Extra scrutiny there.
- The proposed names ("Mauve Sonnet Shirt", "Fuchsia Chapter Maxi", ...)
  follow the brand's poetic naming voice and were checked against the
  existing catalog to avoid duplicates - rename freely in the CSV before
  import; the lookbook follows suit via `src/data/new-collection.ts`.
