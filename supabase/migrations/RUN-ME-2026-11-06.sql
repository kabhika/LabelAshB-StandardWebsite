-- RUN-ME-2026-11-06.sql
-- One-paste file for the Supabase SQL Editor: combines pending migrations
--   0005 order_items.product_id snapshot column (idempotent)
--   0007 product description grammar fixes (no-op after render patches)
--   0008 full size run S-3XL on every product + Rs 500 for XL/2XL/3XL
-- Paste the WHOLE file into: Supabase Dashboard -> SQL Editor -> New query -> Run

-- ================= 0005 =================
-- 0005: order_items.product_id -- a reliable product snapshot column.
--
-- The Crimson Tiles investigation (Oct 31 2026) found order_items stored
-- variant_id but NOT product_id: product identity was only recoverable
-- through the variant, which order_items.variant_id may lose entirely
-- ("on delete set null"). This adds a nullable product_id snapshot
-- reference, backfilled from the variant's parent product. Nullable on
-- purpose -- existing rows whose variant is already gone stay as they
-- are (title snapshot still identifies the garment); nothing is rewritten
-- and no order data changes meaning.

alter table order_items
  add column if not exists product_id uuid references products (id) on delete set null;

update order_items oi
set product_id = pv.product_id
from product_variants pv
where oi.variant_id = pv.id
  and oi.product_id is null;

create index if not exists idx_order_items_product on order_items (product_id);

-- ================= 0007 =================
-- 0006_fix_description_text.sql  (Nov 6 2026)
-- Source-of-truth fix for the grammar/copy errors found by the site
-- quality audit. The website already renders corrected text through
-- src/lib/shopify/description-text.ts (applyDescriptionPatches), so this
-- migration is safe to run at any time: once applied, the code patches
-- stop matching and become no-ops.
--
-- Run in Supabase Dashboard -> SQL Editor -> New query, then paste and Run.
-- Everything is idempotent (replace() no-ops when the old text is gone).

-- 1) Midnight Botanical Kaftan Set: "arries" -> "carries"
UPDATE products
SET description     = replace(description, 'modal silk arries a bold botanical', 'modal silk carries a bold botanical'),
    description_html = replace(description_html, 'modal silk arries a bold botanical', 'modal silk carries a bold botanical')
WHERE handle = 'the-midnight-botanical-kaftan-set';

-- 2) Crimson Tiles Dress: missing space after full stop
UPDATE products
SET description     = replace(description, 'clothes.Natural cotton', 'clothes. Natural cotton'),
    description_html = replace(description_html, 'clothes.Natural cotton', 'clothes. Natural cotton')
WHERE handle = 'the-crimson-tiles-linen-dress';

-- 3) Missing comma in care boilerplate (8 products)
UPDATE products
SET description     = replace(description, 'If washing at home wash separately', 'If washing at home, wash separately'),
    description_html = replace(description_html, 'If washing at home wash separately', 'If washing at home, wash separately')
WHERE handle IN (
  'the-crimson-tiles-linen-dress',
  'rani-linen-shirt',
  'coral-vine-linen-dress',
  'mint-meadow-hand-embroidered-linen-dress',
  'salmon-wildflower-ruffle-dress',
  'the-ivory-garden-embroidered-dress',
  'saffron-muse-dress',
  'the-regal-amethyst-co-ord-set'
);

-- 4) Dark Paisley Dress: run-on sentence + stray capital
UPDATE products
SET description     = replace(description, 'and wash separately which is important for Natural handblock prints', 'and wash separately - this is important for natural handblock prints'),
    description_html = replace(description_html, 'and wash separately which is important for Natural handblock prints', 'and wash separately - this is important for natural handblock prints')
WHERE handle = 'dark-paisley-block-print-dress';

-- 5) Saffron Muse Dress: remove duplicated detergent line
UPDATE products
SET description     = replace(description, 'as these are naturally dyed clothes. Use mild detergent only.', 'as these are naturally dyed clothes.'),
    description_html = replace(description_html, 'as these are naturally dyed clothes. Use mild detergent only.', 'as these are naturally dyed clothes.')
WHERE handle = 'saffron-muse-dress';

-- 6) Tile and Terra Set: description still uses the old misspelled name
UPDATE products
SET description     = replace(description, 'The Saphire Flow Set pairs', 'The Tile and Terra Set pairs'),
    description_html = replace(description_html, 'The Saphire Flow Set pairs', 'The Tile and Terra Set pairs')
WHERE handle = 'the-saphire-flow-set';

-- 7) NOT AUTOMATED -- "Default Title" size variants on three products.
--    These products have a single Shopify-import placeholder variant named
--    "Default Title" instead of real sizes, so customers cannot pick a size.
--    Fixing this needs business decisions (which sizes, price per size,
--    stock counts), so it is documented here rather than auto-run:
--
--    long-pure-sleeve-linen-shirt
--    the-midnight-botanical-kaftan-set
--    the-regal-amethyst-co-ord-set
--
--    Pattern to use per size (example for S; repeat per size with real
--    inventory numbers and SKUs):
-- INSERT INTO product_variants (product_id, title, sku, price, inventory_quantity, position)
-- SELECT id, 'S', '<SKU>', <price>, <stock>, 1 FROM products WHERE handle = '<handle>';
-- UPDATE product_variants SET title = 'One Size' WHERE title = 'Default Title' AND product_id = (SELECT id FROM products WHERE handle = '<handle>');
--    (or delete the placeholder variant once real size variants exist)

-- ================= 0008 =================
-- 0007_sizes_and_pricing.sql  (Nov 6 2026)
-- Client request: every product carries the full size run S, M, L, XL,
-- 2XL, 3XL; S/M/L keep the product's base price; XL, 2XL and 3XL cost
-- base + Rs 500. Also retires the three "Default Title" placeholder
-- variants (they are zeroed, not deleted, so past order rows keep
-- resolving).
--
-- Safe to re-run: inserts are guarded with NOT EXISTS and the price
-- update recomputes from products.price_min every time.

BEGIN;

-- 0) Backup so this is fully reversible
CREATE TABLE IF NOT EXISTS product_variants_backup_20261106 AS
  SELECT * FROM product_variants;

-- 1) Insert any missing size S/M/L/XL/2XL/3XL for every active product.
--    New S/M/L rows get the base price; new XL/2XL/3XL rows get base+500.
--    Hidden product (lime-green set) excluded. New sizes start with a
--    modest stock of 5 (made-to-order is cut to size weekly anyway).
INSERT INTO product_variants (product_id, title, sku, price, inventory_quantity, position)
SELECT p.id,
       s.size,
       NULL,
       p.price_min + CASE WHEN s.size IN ('XL', '2XL', '3XL') THEN 500 ELSE 0 END,
       5,
       s.pos
FROM products p
CROSS JOIN (VALUES
  ('S', 1), ('M', 2), ('L', 3), ('XL', 4), ('2XL', 5), ('3XL', 6)
) AS s(size, pos)
WHERE p.status = 'active'
  AND p.handle <> 'lime-green-linen-co-ord-set'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants v
    WHERE v.product_id = p.id AND v.title = s.size
  );

-- 2) Reprice every XL/2XL/3XL to base + 500 (existing and just-inserted)
UPDATE product_variants v
SET price = p.price_min + 500
FROM products p
WHERE v.product_id = p.id
  AND p.status = 'active'
  AND p.handle <> 'lime-green-linen-co-ord-set'
  AND v.title IN ('XL', '2XL', '3XL');

-- 3) Retire the Shopify-import "Default Title" placeholders
--    (real size rows now exist for those products; stock zeroed so the
--    placeholder can no longer be bought, row kept for order history)
UPDATE product_variants
SET inventory_quantity = 0
WHERE title = 'Default Title';

-- 4) Keep products.price_min/price_max consistent with the variants
UPDATE products p
SET price_min = (SELECT MIN(v.price) FROM product_variants v WHERE v.product_id = p.id),
    price_max = (SELECT MAX(v.price) FROM product_variants v WHERE v.product_id = p.id)
WHERE p.status = 'active';

COMMIT;

-- Quick eyeball check after running:
-- SELECT p.handle, v.title, v.price, v.inventory_quantity
-- FROM products p JOIN product_variants v ON v.product_id = p.id
-- WHERE p.handle IN ('the-crimson-tiles-linen-dress','the-midnight-botanical-kaftan-set')
-- ORDER BY p.handle, v.position;
