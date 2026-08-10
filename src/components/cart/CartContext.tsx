"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ShopifyCart } from "@/lib/shopify/cart";
import {
  addToCartAction,
  getCartAction,
  removeCartLineAction,
  updateCartLineAction,
} from "@/app/actions/cart";

interface CartContextValue {
  cart: ShopifyCart | null;
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
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
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
    if (!res.error) setIsOpen(true);
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
        closeCart: () => setIsOpen(false),
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
