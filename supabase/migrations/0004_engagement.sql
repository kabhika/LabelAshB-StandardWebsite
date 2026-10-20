-- Label AshB: engagement captures - LABLOVE exit popup, size-restock
-- notifications, newsletter (Oct 2026, Phase 3). Insert-only for the
-- public anon key; rows are read and managed from Supabase Studio with
-- the service role (which bypasses RLS).

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 320),
  source text not null check (source in ('exit_popup', 'notify_size', 'newsletter')),
  product_handle text,                       -- notify_size: which product
  variant_title text,                         -- notify_size: which size
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_created_at on leads (created_at desc);
create index if not exists idx_leads_source on leads (source);

alter table leads enable row level security;

-- Visitors may only ever append a row. No public select/update/delete:
-- a lead list is customer data, so nothing but the service role reads it
-- (same posture as orders/order_items in 0001_init.sql).
create policy "public can insert leads"
  on leads for insert
  with check (true);
