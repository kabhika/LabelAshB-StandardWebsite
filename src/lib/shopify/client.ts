// Server-only. This token is a Storefront API PRIVATE access token: it must
// never be sent to the browser and must never be read from a NEXT_PUBLIC_*
// env var. Only call this from Server Components, Route Handlers, or other
// server-side code.

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = "2026-07";

export interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export async function shopifyStorefront<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { revalidate?: number },
): Promise<T> {
  if (!STORE_DOMAIN || !STOREFRONT_TOKEN) {
    throw new Error(
      "Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN env vars",
    );
  }

  const res = await fetch(
    `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Private Storefront token header, confirmed against this store's
        // Headless channel token. The public header
        // (X-Shopify-Storefront-Access-Token) does not authenticate this
        // token — verified 401 against it, 200 against this one.
        "Shopify-Storefront-Private-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      next: options?.revalidate !== undefined
        ? { revalidate: options.revalidate }
        : undefined,
    },
  );

  const json: ShopifyGraphQLResponse<T> = await res.json();

  if (!res.ok || json.errors?.length) {
    throw new Error(
      `Shopify Storefront API error: ${res.status} ${JSON.stringify(json.errors)}`,
    );
  }

  return json.data as T;
}
