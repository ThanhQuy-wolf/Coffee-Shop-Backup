"use client";

import { createContext, useContext, useMemo } from "react";

import { useLocalStorage } from "../hooks/use-local-storage";
import type { CreateOrderRequest, OrderItemType } from "../types";

/** One product or combo in the cart. A line is identified by `type` + `id`. */
export interface CartLine {
  type: OrderItemType;
  id: number;
  name: string;
  /** Price when added; the server re-checks it (BR-22) */
  unitPrice: number;
  quantity: number;
}

/** FR-11: the cart lives on the device until the order is placed */
export interface Cart {
  lines: CartLine[];
  /** Kept with the cart so a retry after a network error reuses it (BR-24) */
  idempotencyKey: string;
}

interface CartContextValue {
  /** Current cart, `null` when empty. */
  cart: Cart | null;
  /** Sum of all quantities. */
  totalItems: number;
  /** Sum of `unitPrice × quantity`, in đồng. */
  totalPrice: number;
  /**
   * Adds one unit of an item. A new item gets its own line, an item already
   * in the cart gets its quantity increased.
   *
   * @param line - the item without quantity
   */
  addToCart: (line: Omit<CartLine, "quantity">) => void;
  /**
   * Replaces the whole cart, e.g. to reorder after an order expired
   * (UC-11, BR-28). A new Idempotency-Key is created.
   *
   * @param cart - lines to put in the cart; empty lines clear it
   */
  loadCart: (cart: Omit<Cart, "idempotencyKey">) => void;
  /**
   * Sets the quantity of a line. 0 or less removes the line.
   *
   * @param type - `PRODUCT` or `COMBO`
   * @param id - product or combo id
   * @param quantity - new quantity, rounded down
   */
  setQuantity: (type: OrderItemType, id: number, quantity: number) => void;
  /**
   * Removes a line.
   *
   * @param type - `PRODUCT` or `COMBO`
   * @param id - product or combo id
   */
  removeLine: (type: OrderItemType, id: number) => void;
  /**
   * Takes the current prices sent by the server after a `BR-22` error.
   *
   * @param prices - new unit price per item
   */
  applyPrices: (
    prices: { type: OrderItemType; id: number; price: number }[],
  ) => void;
  /** Empties the cart, e.g. after the order was placed. */
  clearCart: () => void;
  /**
   * Builds the `items` of the O-1 request body from the cart.
   *
   * @returns one entry per line, with the price the customer saw
   */
  toOrderItems: () => CreateOrderRequest["items"];
}

// v3: carts without shopId (single shop), so older carts are dropped.
const STORAGE_KEY = "coffee-shop-cart-v3";
const CartContext = createContext<CartContextValue | null>(null);

/**
 * Validates the cart read from localStorage.
 *
 * @param v - parsed JSON
 * @returns the cart without empty lines, or `null` when the shape is wrong
 */
function parseCart(v: unknown): Cart | null {
  if (!v || typeof v !== "object") return null;
  const c = v as Cart;
  if (!Array.isArray(c.lines)) return null;
  return { ...c, lines: c.lines.filter((l) => l && l.quantity > 0) };
}

/**
 * Creates an Idempotency-Key for the O-1 request (BR-24).
 *
 * @returns a UUID v4
 */
function newKey() {
  return crypto.randomUUID();
}

/**
 * Tells whether a cart line is the given item.
 *
 * @param l - cart line
 * @param type - `PRODUCT` or `COMBO`
 * @param id - product or combo id
 */
const same = (l: CartLine, type: OrderItemType, id: number) =>
  l.type === type && l.id === id;

/**
 * Holds the cart for the whole app and saves it in localStorage (FR-11).
 * Mounted once in app/providers.tsx.
 *
 * @param props.children - the app
 */
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

  const addToCart = (line: Omit<CartLine, "quantity">) => {
    if (!cart) {
      setCart({ lines: [{ ...line, quantity: 1 }], idempotencyKey: newKey() });
      return;
    }
    update((lines) =>
      lines.some((l) => same(l, line.type, line.id))
        ? lines.map((l) =>
            same(l, line.type, line.id)
              ? { ...l, quantity: l.quantity + 1 }
              : l,
          )
        : [...lines, { ...line, quantity: 1 }],
    );
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

/**
 * Reads the cart and its actions.
 *
 * @returns the cart context (see `CartContextValue`)
 * @throws {Error} when used outside `CartProvider`
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
