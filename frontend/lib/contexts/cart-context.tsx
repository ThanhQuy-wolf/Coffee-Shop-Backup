"use client";

import { createContext, useContext, useMemo } from "react";

import { useLocalStorage } from "../hooks/use-local-storage";
import type { Product } from "../types";

export interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product) => void;
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  removeFromCart: (id: number) => void;
  setQuantity: (id: number, quantity: number) => void;
}

const STORAGE_KEY = "coffee-shop-cart";
const CartContext = createContext<CartContextValue | null>(null);

function parseCart(v: unknown): CartItem[] {
  if (!Array.isArray(v)) return [];
  return v.filter(
    (i): i is CartItem => !!i && typeof i.id === "number" && i.quantity > 0,
  );
}

const EMPTY_CART: CartItem[] = [];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>(
    STORAGE_KEY,
    EMPTY_CART,
    parseCart,
  );

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === product.id);
      if (index === -1) {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: 1,
          },
        ];
      }

      const next = [...prev];
      next[index] = { ...next[index], quantity: next[index].quantity + 1 };
      return next;
    });
  };

  const increaseQty = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decreaseQty = (id: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const setQuantity = (id: number, quantity: number) => {
    const safeQty = Number.isFinite(quantity)
      ? Math.max(0, Math.floor(quantity))
      : 0;
    if (safeQty === 0) {
      removeFromCart(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: safeQty } : item,
      ),
    );
  };

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    totalItems,
    totalPrice,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    setQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
