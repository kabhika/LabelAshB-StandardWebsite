import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/shopify/catalog";
import { collectionGarments } from "@/data/new-collection";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES = [
  "",
  "/collection",
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

  const collectionEntries: MetadataRoute.Sitemap = collectionGarments.map(
    (garment) => ({
      url: `${SITE_URL}/collection/${garment.slug}`,
      lastModified: new Date(),
    }),
  );

  const productEntries: MetadataRoute.Sitemap = catalog.map((product) => ({
    url: `${SITE_URL}/products/${product.handle}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...collectionEntries, ...productEntries];
}
