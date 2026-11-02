// Minimal password gate for /admin/orders. The password lives in the
// ADMIN_PASSWORD env var; the cookie holds only a hash of it. If the env
// var is unset the admin page stays locked for everyone.

import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "labelashb_admin";

function token(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return crypto.createHash("sha256").update(`labelashb-admin:${pw}`).digest("hex");
}

export function passwordMatches(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(pw);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const expected = token();
  if (!expected) return false;
  const jar = await cookies();
  return jar.get(COOKIE)?.value === expected;
}

export async function setAdminCookie(): Promise<void> {
  const value = token();
  if (!value) return;
  const jar = await cookies();
  jar.set(COOKIE, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete({ name: COOKIE, path: "/admin" });
}
