"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { LocalCart } from "@/lib/cart/cart";
import {
  addToCartAction,
  getCartAction,
  removeCartLineAction,
  updateCartLineAction,
} from "@/app/actions/cart";
import { trackMetaEvent } from "@/lib/meta/pixel";

interface CartContextValue {
  cart: LocalCart | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<LocalCart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCartAction().then((res) => setCart(res.cart));
  }, []);

  const addToCart = useCallback(async (variantId: string, quantity = 1) => {
    setIsLoading(true);
    setError(null);
    const res = await addToCartAction(variantId, quantity);
    setCart(res.cart);
    setError(res.error);
    setIsLoading(false);
    if (!res.error) {
      setIsOpen(true);
      // Meta Pixel AddToCart — no-op when the pixel isn't configured.
      const line = res.cart?.lines.edges
        .map((edge) => edge.node)
        .find((node) => node.merchandise.id === variantId);
      if (line) {
        const itemPrice = Number(line.merchandise.price.amount);
        trackMetaEvent("AddToCart", {
          content_name: line.merchandise.product.title,
          contents: [{ id: variantId, quantity, item_price: itemPrice }],
          content_type: "product",
          value: itemPrice * quantity,
          currency: line.merchandise.price.currencyCode || "INR",
        });
      }
    }
  }, []);

  const updateLine = useCallback(async (lineId: string, quantity: number) => {
    setIsLoading(true);
    setError(null);
    const res = await updateCartLineAction(lineId, quantity);
    setCart(res.cart);
    setError(res.error);
    setIsLoading(false);
  }, []);

  const removeLine = useCallback(async (lineId: string) => {
    setIsLoading(true);
    setError(null);
    const res = await removeCartLineAction(lineId);
    setCart(res.cart);
    setError(res.error);
    setIsLoading(false);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isLoading,
        error,
        openCart: () => setIsOpen(true),
        closeCart,
        addToCart,
        updateLine,
        removeLine,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
