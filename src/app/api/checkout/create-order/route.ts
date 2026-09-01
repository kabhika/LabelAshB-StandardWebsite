// Creates a pending order in Supabase, then a matching Razorpay order.
// This is the one place the amount charged gets decided -- everything
// (price, stock, whether the product is even still active) is re-read
// from the database here. Nothing from the request body is trusted for
// money; the cart cookie only ever supplied variant ids and quantities.

import { NextResponse } from "next/server";
import { readCartItems } from "@/lib/cart/storage";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { razorpay } from "@/lib/razorpay/client";

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface CreateOrderBody {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
}

interface ProductRef {
  title: string;
  status: string;
  product_images: { url: string; position: number }[];
}

interface VariantRef {
  id: string;
  title: string;
  sku: string | null;
  price: string;
  inventory_quantity: number;
  products: ProductRef | null;
}

// Free domestic shipping, matching the published shipping policy
// (/shipping: "free standard shipping on dress orders within India").
// International shipping isn't wired into checkout yet -- out of scope for
// this pass, tracked in MIGRATION.md.
const SHIPPING_AMOUNT = 0;

export async function POST(request: Request) {
  let body: CreateOrderBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { customerName, customerEmail, customerPhone, shippingAddress } = body;

  if (!customerName?.trim() || !customerPhone?.trim()) {
    return NextResponse.json(
      { error: "Name and phone are required." },
      { status: 400 },
    );
  }
  if (
    !shippingAddress?.line1?.trim() ||
    !shippingAddress?.city?.trim() ||
    !shippingAddress?.state?.trim() ||
    !shippingAddress?.pincode?.trim()
  ) {
    return NextResponse.json(
      { error: "A complete shipping address is required." },
      { status: 400 },
    );
  }

  const items = await readCartItems();
  if (items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const { data: variantRows, error: variantError } = await supabaseAdmin
    .from("product_variants")
    .select(
      "id, title, sku, price, inventory_quantity, products ( title, status, product_images ( url, position ) )",
    )
    .in(
      "id",
      items.map((i) => i.variantId),
    );

  if (variantError) {
    return NextResponse.json(
      { error: "Could not load your cart. Please try again." },
      { status: 500 },
    );
  }

  const byId = new Map(
    ((variantRows ?? []) as unknown as VariantRef[]).map((r) => [r.id, r]),
  );

  const orderItems: {
    variant_id: string;
    product_title: string;
    variant_title: string;
    sku: string | null;
    image_url: string | null;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[] = [];

  for (const item of items) {
    const row = byId.get(item.variantId);
    if (!row || !row.products || row.products.status !== "active") {
      return NextResponse.json(
        {
          error:
            "One of the items in your cart is no longer available. Please refresh your cart and try again.",
        },
        { status: 409 },
      );
    }
    if (row.inventory_quantity < item.quantity) {
      return NextResponse.json(
        {
          error: `Only ${row.inventory_quantity} left of "${row.products.title} (${row.title})". Please update the quantity in your cart.`,
        },
        { status: 409 },
      );
    }

    const images = [...row.products.product_images].sort(
      (a, b) => a.position - b.position,
    );

    orderItems.push({
      variant_id: row.id,
      product_title: row.products.title,
      variant_title: row.title,
      sku: row.sku,
      image_url: images[0]?.url ?? null,
      unit_price: Number(row.price),
      quantity: item.quantity,
      line_total: Number(row.price) * item.quantity,
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.line_total, 0);
  const total = subtotal + SHIPPING_AMOUNT;
  const amountInPaise = Math.round(total * 100);

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: customerName.trim(),
      customer_email: customerEmail?.trim() || null,
      customer_phone: customerPhone.trim(),
      shipping_address: shippingAddress,
      subtotal,
      shipping_amount: SHIPPING_AMOUNT,
      total,
      status: "pending",
      payment_status: "created",
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Could not create your order. Please try again." },
      { status: 500 },
    );
  }

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));

  if (itemsError) {
    // The order row exists with no items attached -- left in place rather
    // than auto-deleted, since Abhi manages orders directly in Supabase
    // Studio and a stray row is easy to spot and clean up there.
    return NextResponse.json(
      { error: "Could not save your order. Please try again." },
      { status: 500 },
    );
  }

  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.order_number,
      notes: { supabase_order_id: order.id },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 500 },
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq("id", order.id);

  if (updateError) {
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    supabaseOrderId: order.id,
    orderNumber: order.order_number,
    razorpayOrderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    customerName: customerName.trim(),
    customerEmail: customerEmail?.trim() || undefined,
    customerPhone: customerPhone.trim(),
  });
}
