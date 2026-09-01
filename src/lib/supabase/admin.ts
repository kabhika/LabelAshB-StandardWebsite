// Server-only service-role client. Bypasses RLS entirely -- never import
// this from a Client Component, and never let SUPABASE_SERVICE_ROLE_KEY
// reach the browser. Used for writing orders/order_items (which have no
// public RLS policies at all -- see supabase/migrations/0001_init.sql) and
// for re-reading variant price/stock at checkout time, since that's the
// one place the amount charged gets decided and nothing from the client
// can be trusted for it.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars",
  );
}

export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
