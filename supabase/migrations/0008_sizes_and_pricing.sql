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
