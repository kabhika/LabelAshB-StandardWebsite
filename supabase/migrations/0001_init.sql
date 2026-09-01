-- Label AshB: full Shopify independence schema
-- Catalog + orders, replacing Shopify as commerce backend entirely.
-- Run this once against the new Supabase project (Label AshB org/project).

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- Catalog: products, images, variants
-- ============================================================

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  title text not null,
  description text,
  description_html text,
  category text not null,            -- normalized taxonomy: Dress, Tops, Co-ord Set
  material text,                     -- linen, chanderi silk, crepe silk, cotton, modal silk
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  price_min numeric(10, 2),          -- cached for listing sort/filter, derived from variants
  price_max numeric(10, 2),
  shopify_product_id text,           -- provenance only, not a live dependency
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_status on products (status);
create index if not exists idx_products_category on products (category);
create index if not exists idx_products_material on products (material);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url text not null,
  alt_text text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product on product_images (product_id, position);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  title text not null,               -- e.g. "S", "M", "Default Title"
  sku text,                          -- nullable: source data has real null SKUs, don't force it
  price numeric(10, 2) not null,
  compare_at_price numeric(10, 2),
  inventory_quantity integer not null default 0,
  position integer not null default 0,
  shopify_variant_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_variants_product on product_variants (product_id, position);
create unique index if not exists idx_product_variants_sku on product_variants (sku) where sku is not null;

-- ============================================================
-- Orders: own checkout, Razorpay as the only payment processor
-- ============================================================

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,          -- human-facing, e.g. LAB-1001
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  shipping_address jsonb not null,            -- {line1, line2, city, state, pincode, country}
  subtotal numeric(10, 2) not null,
  shipping_amount numeric(10, 2) not null default 0,
  discount_amount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  currency text not null default 'INR',
  status text not null default 'pending' check (
    status in ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded')
  ),
  payment_status text not null default 'created' check (
    payment_status in ('created', 'authorized', 'captured', 'failed', 'refunded')
  ),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_status on orders (status);
create index if not exists idx_orders_razorpay_order on orders (razorpay_order_id);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  variant_id uuid references product_variants (id) on delete set null,
  product_title text not null,        -- snapshotted at order time, survives catalog edits
  variant_title text not null,
  sku text,
  image_url text,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on order_items (order_id);

-- ============================================================
-- updated_at trigger
-- ============================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

drop trigger if exists trg_product_variants_updated_at on product_variants;
create trigger trg_product_variants_updated_at
  before update on product_variants
  for each row execute function set_updated_at();

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Catalog is public read, active items only. Writes only via service role
-- (Abhi manages the catalog from Supabase Studio or the migration script,
-- which both use the service role key and bypass RLS).
create policy "public can read active products"
  on products for select
  using (status = 'active');

create policy "public can read images of active products"
  on product_images for select
  using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.status = 'active'
    )
  );

create policy "public can read variants of active products"
  on product_variants for select
  using (
    exists (
      select 1 from products
      where products.id = product_variants.product_id
      and products.status = 'active'
    )
  );

-- Orders and order_items: no public policies at all. Every order is
-- created and read through server-side code using the service role key
-- (Razorpay order creation, payment verification webhook). Nothing about
-- an order should ever be reachable with the anon key.
