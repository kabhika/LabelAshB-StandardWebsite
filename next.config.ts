import type { NextConfig } from "next";

// Derived from the env var rather than hardcoded, so this doesn't silently
// break again if the Supabase project ever moves orgs/projects the way it
// did once already during this migration (see MIGRATION.md).
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Self-hosted product images, Supabase Storage's "product-images"
      // bucket (see supabase/migrations/0002_storage.sql). Replaces
      // cdn.shopify.com now that catalog images are no longer hotlinked
      // from Shopify -- see MIGRATION.md, "full Shopify independence".
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
