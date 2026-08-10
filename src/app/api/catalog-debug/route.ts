import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/shopify/catalog";

// Phase 1 gate route: prints the full normalized catalog with a count.
// Not linked from any page — debug-only, safe to remove once Phase 3
// catalog pages exist and cover this.
export async function GET() {
  const products = await getCatalog();

  const nullSkuProducts = products
    .filter((p) => p.variants.some((v) => v.sku === null))
    .map((p) => p.title);

  const zeroStockOnlyProducts = products
    .filter((p) => !p.inStock)
    .map((p) => p.title);

  const categories = [...new Set(products.map((p) => p.category))];

  return NextResponse.json({
    count: products.length,
    categories,
    nullSkuProducts,
    zeroStockOnlyProducts,
    products: products.map((p) => ({
      title: p.title,
      handle: p.handle,
      category: p.category,
      rawProductType: p.rawProductType,
      materials: p.materials,
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      currencyCode: p.currencyCode,
      inStock: p.inStock,
      imageCount: p.images.length,
      variantCount: p.variants.length,
    })),
  });
}
