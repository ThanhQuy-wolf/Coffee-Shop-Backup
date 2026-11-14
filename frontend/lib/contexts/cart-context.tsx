"use client";

import { createContext, useContext, useMemo } from "react";

import { useLocalStorage } from "../hooks/use-local-storage";
import type { CreateOrderRequest, OrderItemType } from "../types";

export interface CartLine {
  type: OrderItemType;
  id: number;
  name: string;
  /** Price when added; the server re-checks it (BR-22) */
  unitPrice: number;
  quantity: number;
}

/** FR-11 / BR-20: a cart belongs to exactly one shop */
export interface Cart {
  shopId: number;
  shopName: string;
  lines: CartLine[];
  /** Kept with the cart so a retry after a network error reuses it (BR-24) */
  idempotencyKey: string;
}

export interface CartAddInput {
  shopId: number;
  shopName: string;
  line: Omit<CartLine, "quantity">;
}

interface CartContextValue {
  cart: Cart | null;
  totalItems: number;
  totalPrice: number;
  /** false when the cart holds another shop's items; call replaceCart to confirm */
  addToCart: (input: CartAddInput) => boolean;
  replaceCart: (input: CartAddInput) => void;
  /** Reorder after an expired order (UC-11, BR-28): replaces the whole cart */
  loadCart: (cart: Omit<Cart, "idempotencyKey">) => void;
  setQuantity: (type: OrderItemType, id: number, quantity: number) => void;
  removeLine: (type: OrderItemType, id: number) => void;
  /** After BR-22: take the server's prices */
  applyPrices: (
    prices: { type: OrderItemType; id: number; price: number }[],
  ) => void;
  clearCart: () => void;
  toOrderItems: () => CreateOrderRequest["items"];
}

const STORAGE_KEY = "coffee-shop-cart-v2";
const CartContext = createContext<CartContextValue | null>(null);

function parseCart(v: unknown): Cart | null {
  if (!v || typeof v !== "object") return null;
  const c = v as Cart;
  if (typeof c.shopId !== "number" || !Array.isArray(c.lines)) return null;
  return { ...c, lines: c.lines.filter((l) => l && l.quantity > 0) };
}

function newKey() {
  return crypto.randomUUID();
}

const same = (l: CartLine, type: OrderItemType, id: number) =>
  l.type === type && l.id === id;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useLocalStorage<Cart | null>(
    STORAGE_KEY,
    null,
    parseCart,
  );

  // Any change to the content gets a new key: it is a different order now.
  const update = (fn: (lines: CartLine[]) => CartLine[]) =>
    setCart((prev) => {
      if (!prev) return prev;
      const lines = fn(prev.lines).filter((l) => l.quantity > 0);
      return lines.length ? { ...prev, lines, idempotencyKey: newKey() } : null;
    });

  const replaceCart = ({ shopId, shopName, line }: CartAddInput) =>
    setCart({
      shopId,
      shopName,
      lines: [{ ...line, quantity: 1 }],
      idempotencyKey: newKey(),
    });

  const addToCart = (input: CartAddInput) => {
    if (cart && cart.shopId !== input.shopId) return false;
    if (!cart) {
      replaceCart(input);
      return true;
    }
    const { type, id } = input.line;
    update((lines) =>
      lines.some((l) => same(l, type, id))
        ? lines.map((l) =>
            same(l, type, id) ? { ...l, quantity: l.quantity + 1 } : l,
          )
        : [...lines, { ...input.line, quantity: 1 }],
    );
    return true;
  };

  const setQuantity = (type: OrderItemType, id: number, quantity: number) => {
    const safe = Number.isFinite(quantity)
      ? Math.max(0, Math.floor(quantity))
      : 0;
    update((lines) =>
      lines.map((l) => (same(l, type, id) ? { ...l, quantity: safe } : l)),
    );
  };

  const removeLine = (type: OrderItemType, id: number) =>
    update((lines) => lines.filter((l) => !same(l, type, id)));

  const applyPrices: CartContextValue["applyPrices"] = (prices) =>
    update((lines) =>
      lines.map((l) => {
        const p = prices.find((x) => same(l, x.type, x.id));
        return p ? { ...l, unitPrice: p.price } : l;
      }),
    );

  const totals = useMemo(() => {
    const lines = cart?.lines ?? [];
    return {
      totalItems: lines.reduce((s, l) => s + l.quantity, 0),
      totalPrice: lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    };
  }, [cart]);

  const value: CartContextValue = {
    cart,
    ...totals,
    addToCart,
    replaceCart,
    loadCart: (c) =>
      setCart(c.lines.length ? { ...c, idempotencyKey: newKey() } : null),
    setQuantity,
    removeLine,
    applyPrices,
    clearCart: () => setCart(null),
    toOrderItems: () =>
      (cart?.lines ?? []).map((l) => ({
        type: l.type,
        id: l.id,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      })),
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
