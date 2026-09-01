// Cart building: turns stored {variantId, quantity} references into a
// display-ready cart by reading current price/stock/image straight from
// Supabase every time. Shape (LocalCart, its lines/merchandise nesting)
// mirrors the old Shopify cart type on purpose so CartContext/CartDrawer
// needed no structural changes -- see MIGRATION.md.

import { supabaseCatalog } from "@/lib/supabase/client";
import type { CartItem } from "./storage";

export interface LocalCartLine {
  id: string; // = variant id; one line per variant, quantity holds the count
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    quantityAvailable: number | null;
    price: { amount: string; currencyCode: string };
    image: { url: string; altText: string | null } | null;
    product: { title: string; handle: string };
  };
}

export interface LocalCart {
  totalQuantity: number;
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    subtotalAmount: { amount: string; currencyCode: string };
  };
  lines: { edges: { node: LocalCartLine }[] };
}

interface VariantRow {
  id: string;
  title: string;
  price: string;
  inventory_quantity: number;
  products: {
    title: string;
    handle: string;
    status: string;
    product_images: { url: string; alt_text: string | null; position: number }[];
  } | null;
}

const VARIANT_SELECT = `
  id, title, price, inventory_quantity,
  products (
    title, handle, status,
    product_images ( url, alt_text, position )
  )
`;

function emptyCart(): LocalCart {
  return {
    totalQuantity: 0,
    cost: {
      totalAmount: { amount: "0", currencyCode: "INR" },
      subtotalAmount: { amount: "0", currencyCode: "INR" },
    },
    lines: { edges: [] },
  };
}

// Returns both the display cart and the subset of `items` that still
// resolved to a real, active variant -- callers persist that subset back
// to the cart cookie so a deleted/archived product quietly drops out of
// the cart instead of erroring on every subsequent render.
export async function buildCart(
  items: CartItem[],
): Promise<{ cart: LocalCart; validItems: CartItem[] }> {
  if (items.length === 0) {
    return { cart: emptyCart(), validItems: [] };
  }

  const { data, error } = await supabaseCatalog
    .from("product_variants")
    .select(VARIANT_SELECT)
    .in(
      "id",
      items.map((i) => i.variantId),
    );

  if (error) {
    throw new Error(`Supabase cart query failed: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as VariantRow[];
  const byId = new Map(rows.map((r) => [r.id, r]));

  const validItems: CartItem[] = [];
  const nodes: LocalCartLine[] = [];

  for (const item of items) {
    const row = byId.get(item.variantId);
    if (!row || !row.products) continue; // deleted, archived, or draft -- drop silently

    validItems.push(item);

    const images = [...row.products.product_images].sort(
      (a, b) => a.position - b.position,
    );
    const image = images[0] ?? null;

    nodes.push({
      id: row.id,
      quantity: item.quantity,
      merchandise: {
        id: row.id,
        title: row.title,
        availableForSale: row.inventory_quantity > 0,
        quantityAvailable: row.inventory_quantity,
        price: { amount: row.price, currencyCode: "INR" },
        image: image ? { url: image.url, altText: image.alt_text } : null,
        product: { title: row.products.title, handle: row.products.handle },
      },
    });
  }

  const subtotal = nodes.reduce(
    (sum, n) => sum + Number(n.merchandise.price.amount) * n.quantity,
    0,
  );

  return {
    cart: {
      totalQuantity: nodes.reduce((sum, n) => sum + n.quantity, 0),
      cost: {
        totalAmount: { amount: subtotal.toFixed(2), currencyCode: "INR" },
        subtotalAmount: { amount: subtotal.toFixed(2), currencyCode: "INR" },
      },
      lines: { edges: nodes.map((node) => ({ node })) },
    },
    validItems,
  };
}
