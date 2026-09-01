// Server-only read client for the public catalog. Uses the anon key --
// RLS on products/product_images/product_variants only allows reading
// rows where the parent product's status = 'active', so this client can
// never see draft products or anything in orders/order_items (those have
// no public policies at all -- see supabase/migrations/0001_init.sql).
//
// Never import this file from a Client Component; it reads
// NEXT_PUBLIC_SUPABASE_ANON_KEY from process.env at request time and is
// meant to run in Server Components / Route Handlers only, same as the
// old src/lib/shopify/client.ts it replaces.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars",
  );
}

// Wrap fetch so catalog reads participate in Next's data cache the same
// way the old shopifyStorefront() calls did (revalidate: 60), instead of
// hitting Postgres on every request.
function cachedFetch(revalidate: number) {
  return (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, { ...init, next: { revalidate } });
}

export const supabaseCatalog = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch: cachedFetch(60) },
  auth: { persistSession: false },
});
