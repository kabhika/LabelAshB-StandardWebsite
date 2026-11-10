import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  customerAuthKey,
  customerAuthUrl,
  customerSessionOptions,
  isCustomerSessionCookie,
} from "@/lib/supabase/customer-auth";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!request.cookies.getAll().some(({ name }) => isCustomerSessionCookie(name))) return response;

  const supabase = createServerClient(customerAuthUrl, customerAuthKey, {
    cookieOptions: customerSessionOptions,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (updates, headers) => {
        for (const { name, value } of updates) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of updates) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });
  await supabase.auth.getClaims();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/my-orders", "/api/checkout/create-order"],
};
