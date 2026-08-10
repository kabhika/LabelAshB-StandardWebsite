import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/shopify/catalog";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES = [
  "",
  "/products",
  "/about",
  "/size-guide",
  "/shipping",
  "/returns",
  "/privacy",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const productEntries: MetadataRoute.Sitemap = catalog.map((product) => ({
    url: `${SITE_URL}/products/${product.handle}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...productEntries];
}
