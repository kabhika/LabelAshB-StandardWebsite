import { shopifyStorefront } from "./client";
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from "./queries";
import {
  reshootsByHandle,
  swapViews,
  SWAP_DESCRIPTIONS,
} from "@/data/product-reshoots";

interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

interface ShopifyVariantRaw {
  id: string;
  sku: string | null;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: ShopifyMoney;
  selectedOptions: { name: string; value: string }[];
}

interface ShopifyProductRaw {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  featuredImage: ShopifyImage | null;
  images: { edges: { node: ShopifyImage }[] };
  variants: { edges: { node: ShopifyVariantRaw }[] };
}

interface ProductsQueryResult {
  products: {
    edges: { cursor: string; node: ShopifyProductRaw }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

interface ProductByHandleResult {
  product: ShopifyProductRaw | null;
}

export interface NormalizedVariant {
  id: string;
  sku: string | null;
  title: string;
  available: boolean;
  quantityAvailable: number;
  price: number;
  currencyCode: string;
  options: { name: string; value: string }[];
}

export interface NormalizedProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  category: string;
  rawProductType: string;
  tags: string[];
  materials: string[];
  images: ShopifyImage[];
  variants: NormalizedVariant[];
  minPrice: number;
  maxPrice: number;
  currencyCode: string;
  inStock: boolean;
}

// Collapses inconsistent Shopify productType casing/naming into one
// display taxonomy. Mapping lives here, not in Shopify — source data is
// never edited.
const CATEGORY_MAP: Record<string, string> = {
  dress: "Dresses",
  tops: "Tops",
  top: "Tops",
  "outfit sets": "Co-ord Sets",
  "co-ord set": "Co-ord Sets",
  "co-ord sets": "Co-ord Sets",
};

function normalizeCategory(productType: string): string {
  const key = productType.trim().toLowerCase();
  return CATEGORY_MAP[key] ?? productType;
}

export const KNOWN_MATERIALS = [
  "linen",
  "crepe-silk",
  "chanderi-silk",
  "cotton",
  "modal-silk",
];

export const DISPLAY_CATEGORIES = [...new Set(Object.values(CATEGORY_MAP))];

// Fabric-collection groups for nav/homepage display - the 3 silk tags
// (crepe-silk, chanderi-silk, modal-silk) combine into one "Silk" group
// rather than three thin ones, per the verified catalog distribution
// (PLACEHOLDER-POLICY.md). Shared by the homepage's fabric showcase and
// the header's Collections dropdown so the grouping can't drift between
// the two - consumers decide for themselves what "present" means (any
// in-stock match, a representative image, etc.).
export const MATERIAL_GROUPS: { label: string; slugs: string[] }[] = [
  { label: "Linen", slugs: ["linen"] },
  { label: "Cotton", slugs: ["cotton"] },
  { label: "Silk", slugs: ["crepe-silk", "chanderi-silk", "modal-silk"] },
];

function extractMaterials(tags: string[]): string[] {
  return tags.filter((tag) => KNOWN_MATERIALS.includes(tag.toLowerCase()));
}

function normalizeVariant(raw: ShopifyVariantRaw): NormalizedVariant {
  const quantityAvailable = raw.quantityAvailable ?? 0;
  return {
    id: raw.id,
    // Null SKUs are a real state in this catalog (a handful of variants
    // have none in Shopify admin) — pass through as null, never fabricate one.
    sku: raw.sku,
    title: raw.title,
    // A variant can be availableForSale:true with quantityAvailable:0 under
    // continue-selling settings; treat it as unavailable to the shopper
    // either way so the PDP never offers a size it can't actually ship.
    available: raw.availableForSale && quantityAvailable > 0,
    quantityAvailable,
    price: Number(raw.price.amount),
    currencyCode: raw.price.currencyCode,
    options: raw.selectedOptions,
  };
}

function normalizeProduct(raw: ShopifyProductRaw): NormalizedProduct {
  const variants = raw.variants.edges.map((e) => normalizeVariant(e.node));
  const prices = variants.map((v) => v.price);
  const images = raw.images.edges.map((e) => e.node);

  const normalized: NormalizedProduct = {
    id: raw.id,
    title: raw.title,
    handle: raw.handle,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    category: normalizeCategory(raw.productType),
    rawProductType: raw.productType,
    tags: raw.tags,
    materials: extractMaterials(raw.tags),
    images: images.length > 0 ? images : raw.featuredImage ? [raw.featuredImage] : [],
    variants,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    currencyCode: variants[0]?.currencyCode ?? "INR",
    inStock: variants.some((v) => v.available),
  };

  return applyReshoot(normalized);
}

// Presentation-layer image overrides. Two tiers:
// 1. Re-shoots (product-reshoots.ts): name-matched on-model photography
//    for 22 mannequin-shot products, plus the client's spreadsheet
//    description (it describes the same garment).
// 2. Presentation swaps (PRESENTATION_SWAPS): mannequin-reading
//    products (the "zoomout_" batch + client-flagged ICM/IMG shots +
//    Folk Tale's flat-lay re-shoot) borrow a New Collection lookbook
//    garment's photos - images only, unless SWAP_DESCRIPTIONS carries
//    the product's own sheet text. The lookbook garment is a different
//    design, so its sheet text would mislead.
// Everything commercial - handle, title, variants, prices, stock - stays
// Shopify's in both tiers, so checkout keeps working and a future
// Shopify CSV import can absorb the photography at the source. Cart line
// items still carry Shopify's own images until then (shopify-import/).
function applyReshoot(product: NormalizedProduct): NormalizedProduct {
  const reshoot = reshootsByHandle.get(product.handle);
  if (reshoot) {
    const description = reshoot.description.replace(/\n+/g, "\n").trim();
    const descriptionHtml = description
      .split("\n")
      .map((para) => `<p>${para.trim()}</p>`)
      .join("");

    return {
      ...product,
      description,
      descriptionHtml,
      images: reshoot.views.map((url, i) => ({
        url,
        altText: `${product.title} - view ${i + 1} of ${reshoot.views.length}`,
        width: 1024,
        height: 1536,
      })),
    };
  }

  const swappedViews = swapViews(product.handle);
  if (swappedViews) {
    // SWAP_DESCRIPTIONS carries the client's sheet text where it
    // describes the real product (e.g. Folk Tale); otherwise the
    // product keeps its own Shopify description.
    const sheetDescription = SWAP_DESCRIPTIONS[product.handle];
    if (sheetDescription) {
      const description = sheetDescription.replace(/\n+/g, "\n").trim();
      return {
        ...product,
        description,
        descriptionHtml: description
          .split("\n")
          .map((para) => `<p>${para.trim()}</p>`)
          .join(""),
        images: swappedViews.map((url, i) => ({
          url,
          altText: `${product.title} - view ${i + 1} of ${swappedViews.length}`,
          width: 1024,
          height: 1536,
        })),
      };
    }
    return {
      ...product,
      images: swappedViews.map((url, i) => ({
        url,
        altText: `${product.title} - view ${i + 1} of ${swappedViews.length}`,
        width: 1024,
        height: 1536,
      })),
    };
  }

  return product;
}

// Storefront API only serves published/active products — draft and
// unpublished products are structurally absent from this response, not
// filtered client-side.
export async function getCatalog(): Promise<NormalizedProduct[]> {
  const products: NormalizedProduct[] = [];
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data: ProductsQueryResult = await shopifyStorefront(
      PRODUCTS_QUERY,
      { first: 50, after },
      { revalidate: 60 },
    );
    products.push(...data.products.edges.map((e) => normalizeProduct(e.node)));
    hasNextPage = data.products.pageInfo.hasNextPage;
    after = data.products.pageInfo.endCursor;
  }

  return products;
}

export async function getProductByHandle(
  handle: string,
): Promise<NormalizedProduct | null> {
  const data: ProductByHandleResult = await shopifyStorefront(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
    { revalidate: 60 },
  );
  return data.product ? normalizeProduct(data.product) : null;
}
