"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ORDER_HISTORY_COOKIE, readOrderHistory } from "@/lib/orders/browser-history";
import { indianMobile } from "@/lib/orders/phone";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { customerAuth, isCustomerSessionCookie } from "@/lib/supabase/customer-auth";

interface SignInState {
  phone?: string;
  message?: string;
  error?: string;
}

async function linkBrowserOrders(phone: string, userId: string) {
  const jar = await cookies();
  const ids = readOrderHistory(jar.get(ORDER_HISTORY_COOKIE)?.value, process.env.RAZORPAY_KEY_SECRET);
  if (!ids.length) return;

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, customer_phone")
    .in("id", ids)
    .is("customer_user_id", null);
  if (error) {
    console.error("Unable to load guest orders for linking", error.code);
    return;
  }
  for (const order of orders ?? []) {
    if (indianMobile(order.customer_phone) !== phone) continue;
    const { error: linkError } = await supabaseAdmin
      .from("orders")
      .update({ customer_user_id: userId })
      .eq("id", order.id)
      .eq("customer_phone", order.customer_phone)
      .is("customer_user_id", null);
    if (linkError) console.error("Unable to link a guest order", linkError.code);
  }
}

export async function signInWithPhone(previous: SignInState, form: FormData): Promise<SignInState> {
  const step = form.get("step");
  if (step === "change") return {};

  const input = form.get("phone");
  const phone = typeof input === "string" && input.length <= 32 ? indianMobile(input) : null;
  if (!phone) return { error: "Enter a valid Indian mobile number." };

  const supabase = await customerAuth();
  if (step === "verify") {
    const token = form.get("code");
    if (typeof token !== "string" || !/^\d{6}$/.test(token.trim())) {
      return { phone, error: "Enter the six-digit code from your SMS." };
    }
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: token.trim(), type: "sms" });
    if (error || !data.session || !data.user?.phone_confirmed_at) {
      return {
        phone,
        error: error?.status === 429
          ? "Too many attempts. Wait a minute and try again."
          : "That code could not be verified. Try again or request a new code.",
      };
    }
    await linkBrowserOrders(phone, data.user.id);
    redirect("/my-orders");
  }

  if (step !== "send" && step !== "resend") return {};
  const { error } = await supabase.auth.signInWithOtp({ phone, options: { channel: "sms" } });
  if (error) {
    return {
      phone: previous.phone,
      error: error.status === 429
        ? "Please wait at least a minute before requesting another code."
        : "We couldn’t send a code right now. Check your number and try again.",
    };
  }
  return { phone, message: "We sent a six-digit code by SMS." };
}

export async function signOutCustomer() {
  await (await customerAuth()).auth.signOut({ scope: "local" });
  const jar = await cookies();
  for (const { name } of jar.getAll()) {
    if (isCustomerSessionCookie(name)) jar.delete(name);
  }
  redirect("/my-orders");
}
