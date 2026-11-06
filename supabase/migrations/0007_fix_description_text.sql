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
