-- Public bucket for self-hosted product images. Public buckets serve
-- objects at /storage/v1/object/public/... without needing a storage RLS
-- read policy -- the bucket's public flag handles that. Writes still
-- require the service role key (used only by the migration script and
-- any future admin tooling), which bypasses RLS entirely.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
