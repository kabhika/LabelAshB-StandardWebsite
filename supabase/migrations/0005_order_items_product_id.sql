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
