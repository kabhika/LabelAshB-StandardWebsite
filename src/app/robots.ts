import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Dev/debug-only routes, never meant for indexing.
      disallow: ["/style-tile", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
