"use server";

import { redirect } from "next/navigation";
import { clearAdminCookie, passwordMatches, setAdminCookie } from "@/lib/admin/auth";

export async function adminLogin(formData: FormData): Promise<void> {
  const pw = String(formData.get("password") ?? "");
  if (!passwordMatches(pw)) redirect("/admin/orders?error=1");
  await setAdminCookie();
  redirect("/admin/orders");
}

export async function adminLogout(): Promise<void> {
  await clearAdminCookie();
  redirect("/admin/orders");
}
