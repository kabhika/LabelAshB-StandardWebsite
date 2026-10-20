import { NextResponse } from "next/server";
import { supabaseCatalog } from "@/lib/supabase/client";

// Engagement captures (LABLOVE exit popup, size-restock requests,
// newsletter). The anon key + RLS (migration 0004_engagement.sql) lets
// anyone append a lead row and lets nobody read them - leads are read
// from Supabase Studio with the service role. If the leads table has
// not been created yet (migration not run), respond ok:false so the UI
// can fall back to WhatsApp capture instead of pretending the address
// was stored.
const SOURCES = new Set(["exit_popup", "notify_size", "newsletter"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Honeypot: the popup renders an off-screen "company" field that real
  // users never see or fill - anything in it is a bot, answered with a
  // fake success so the bot moves on.
  if (typeof body.company === "string" && body.company.length > 0) {
    return NextResponse.json({ ok: true, stored: false });
  }

  if (
    typeof body.email !== "string" ||
    !EMAIL_RE.test(body.email) ||
    body.email.length > 320
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof body.source !== "string" || !SOURCES.has(body.source)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const insert: Record<string, string> = { email: body.email, source: body.source };
  if (typeof body.productHandle === "string" && body.productHandle.length <= 200) {
    insert.product_handle = body.productHandle;
  }
  if (typeof body.variantTitle === "string" && body.variantTitle.length <= 100) {
    insert.variant_title = body.variantTitle;
  }

  const { error } = await supabaseCatalog.from("leads").insert(insert);
  return NextResponse.json({ ok: !error, stored: !error });
}
