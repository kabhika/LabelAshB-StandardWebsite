import { shopifyStorefront } from "./client";

const CART_FRAGMENT = /* GraphQL */ `
  id
  checkoutUrl
  totalQuantity
  cost {
    totalAmount {
      amount
      currencyCode
    }
    subtotalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            quantityAvailable
            price {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
            product {
              title
              handle
            }
          }
        }
      }
    }
  }
`;

export interface CartLine {
  id: string;
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

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    subtotalAmount: { amount: string; currencyCode: string };
  };
  lines: { edges: { node: CartLine }[] };
}

interface UserError {
  field: string[] | null;
  message: string;
}

export async function createCart(
  variantId: string,
  quantity: number,
): Promise<{ cart: ShopifyCart | null; errors: UserError[] }> {
  const data = await shopifyStorefront<{
    cartCreate: { cart: ShopifyCart | null; userErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation CartCreate($lines: [CartLineInput!]) {
        cartCreate(input: { lines: $lines }) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { lines: [{ merchandiseId: variantId, quantity }] },
  );
  return { cart: data.cartCreate.cart, errors: data.cartCreate.userErrors };
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyStorefront<{ cart: ShopifyCart | null }>(
    /* GraphQL */ `
      query CartGet($cartId: ID!) {
        cart(id: $cartId) {
          ${CART_FRAGMENT}
        }
      }
    `,
    { cartId },
  );
  return data.cart;
}

export async function addCartLine(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<{ cart: ShopifyCart | null; errors: UserError[] }> {
  const data = await shopifyStorefront<{
    cartLinesAdd: { cart: ShopifyCart | null; userErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] },
  );
  return { cart: data.cartLinesAdd.cart, errors: data.cartLinesAdd.userErrors };
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<{ cart: ShopifyCart | null; errors: UserError[] }> {
  const data = await shopifyStorefront<{
    cartLinesUpdate: { cart: ShopifyCart | null; userErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { cartId, lines: [{ id: lineId, quantity }] },
  );
  return {
    cart: data.cartLinesUpdate.cart,
    errors: data.cartLinesUpdate.userErrors,
  };
}

export async function removeCartLine(
  cartId: string,
  lineId: string,
): Promise<{ cart: ShopifyCart | null; errors: UserError[] }> {
  const data = await shopifyStorefront<{
    cartLinesRemove: { cart: ShopifyCart | null; userErrors: UserError[] };
  }>(
    /* GraphQL */ `
      mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { cartId, lineIds: [lineId] },
  );
  return {
    cart: data.cartLinesRemove.cart,
    errors: data.cartLinesRemove.userErrors,
  };
}
