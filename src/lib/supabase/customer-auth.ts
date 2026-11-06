import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export const customerSessionOptions = {
  name: "labelashb_customer",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function isCustomerSessionCookie(name: string) {
  return name === customerSessionOptions.name || name.startsWith(customerSessionOptions.name + ".");
}

export const customerAuthUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const customerAuthKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function customerAuth(writable = true) {
  const jar = await cookies();
  return createServerClient(customerAuthUrl, customerAuthKey, {
    cookieOptions: customerSessionOptions,
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (updates) => {
        if (!writable) return;
        for (const { name, value, options } of updates) jar.set(name, value, options);
      },
    },
  });
}

export const getCustomer = cache(async () => {
  const jar = await cookies();
  if (!jar.getAll().some(({ name }) => isCustomerSessionCookie(name))) return null;
  const { data: { user } } = await (await customerAuth(false)).auth.getUser();
  return user?.phone && user.phone_confirmed_at ? user : null;
});
