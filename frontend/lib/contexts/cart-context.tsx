"use client";

import { createContext, useContext, useMemo } from "react";

import { useLocalStorage } from "../hooks/use-local-storage";
import type {
  CreateOrderRequest,
  OrderItemOption,
  OrderItemType,
} from "../types";

/** A chosen option on a cart line, same shape as on the order (BR-17). */
export type CartLineOption = OrderItemOption;

/** One product or combo in the cart, with the options chosen for it. */
export interface CartLine {
  /** Same product with other options is another line (BR-23) */
  key: string;
  type: OrderItemType;
  id: number;
  name: string;
  /** Price when added, options included; the server re-checks it (BR-22) */
  unitPrice: number;
  quantity: number;
  options: CartLineOption[];
}

/** A line before it gets its key and quantity. */
export type NewCartLine = Omit<CartLine, "key" | "quantity">;

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
   * Adds units of an item. The same item with the same options adds to the
   * existing line; other options make a new line (BR-23).
   *
   * @param line - the item and its chosen options
   * @param quantity - units to add, 1 by default
   */
  addToCart: (line: NewCartLine, quantity?: number) => void;
  /**
   * Replaces the whole cart, e.g. to reorder after an order expired
   * (UC-11, BR-28). A new Idempotency-Key is created.
   *
   * @param lines - lines with their quantity; an empty list clears the cart
   */
  loadCart: (lines: (NewCartLine & { quantity: number })[]) => void;
  /**
   * Sets the quantity of a line. 0 or less removes the line.
   *
   * @param key - the line's `key`
   * @param quantity - new quantity, rounded down
   */
  setQuantity: (key: string, quantity: number) => void;
  /**
   * Removes a line.
   *
   * @param key - the line's `key`
   */
  removeLine: (key: string) => void;
  /**
   * Takes the current prices sent by the server after a `BR-22` error.
   *
   * @param prices - new unit price, options included, per line key
   */
  applyPrices: (prices: { key: string; price: number }[]) => void;
  /** Empties the cart, e.g. after the order was placed. */
  clearCart: () => void;
  /**
   * Builds the `items` of the O-1 request body from the cart, in line order,
   * so the `line` index in the server's errors points back to a cart line.
   *
   * @returns one entry per line, with the price the customer saw and, for
   *   products, the chosen `optionValueIds`
   */
  toOrderItems: () => CreateOrderRequest["items"];
}

// v4: lines carry options and a key. Older carts are dropped.
const STORAGE_KEY = "coffee-shop-cart-v4";
const CartContext = createContext<CartContextValue | null>(null);

/**
 * Key of a cart line: the item plus its sorted option value ids.
 *
 * @param type - `PRODUCT` or `COMBO`
 * @param id - product or combo id
 * @param options - chosen options
 * @returns e.g. `PRODUCT-5-2.5.11`
 */
export function lineKey(
  type: OrderItemType,
  id: number,
  options: { optionValueId: number }[],
) {
  const ids = options.map((o) => o.optionValueId).sort((a, b) => a - b);
  return `${type}-${id}-${ids.join(".")}`;
}

/**
 * Validates the cart read from localStorage.
 *
 * @param v - parsed JSON
 * @returns the cart without empty or keyless lines, or `null` when nothing
 *   usable is left
 */
function parseCart(v: unknown): Cart | null {
  if (!v || typeof v !== "object") return null;
  const c = v as Cart;
  if (!Array.isArray(c.lines)) return null;
  const lines = c.lines.filter(
    (l) => l && l.quantity > 0 && typeof l.key === "string",
  );
  return lines.length ? { ...c, lines } : null;
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
 * Turns a new line into a cart line.
 *
 * @param line - item and options
 * @param quantity - units
 */
const withKey = (line: NewCartLine, quantity: number): CartLine => ({
  ...line,
  key: lineKey(line.type, line.id, line.options),
  quantity,
});

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

  const addToCart = (line: NewCartLine, quantity = 1) => {
    const added = withKey(line, quantity);
    if (!cart) {
      setCart({ lines: [added], idempotencyKey: newKey() });
      return;
    }
    update((lines) =>
      lines.some((l) => l.key === added.key)
        ? lines.map((l) =>
            l.key === added.key ? { ...l, quantity: l.quantity + quantity } : l,
          )
        : [...lines, added],
    );
  };

  const setQuantity = (key: string, quantity: number) => {
    const safe = Number.isFinite(quantity)
      ? Math.max(0, Math.floor(quantity))
      : 0;
    update((lines) =>
      lines.map((l) => (l.key === key ? { ...l, quantity: safe } : l)),
    );
  };

  const removeLine = (key: string) =>
    update((lines) => lines.filter((l) => l.key !== key));

  const applyPrices: CartContextValue["applyPrices"] = (prices) =>
    update((lines) =>
      lines.map((l) => {
        const p = prices.find((x) => x.key === l.key);
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
    loadCart: (lines) =>
      setCart(
        lines.length
          ? {
              lines: lines.map(({ quantity, ...l }) => withKey(l, quantity)),
              idempotencyKey: newKey(),
            }
          : null,
      ),
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
        ...(l.type === "PRODUCT"
          ? { optionValueIds: l.options.map((o) => o.optionValueId) }
          : {}),
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
