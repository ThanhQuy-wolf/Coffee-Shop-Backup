"use client";

import { useLocalStorage } from "./use-local-storage";

type TokenMap = Record<string, string>;

const EMPTY: TokenMap = {};
/**
 * Accepts only an object read from storage; anything else becomes empty.
 * @param v The parsed JSON value.
 */
const parse = (v: unknown): TokenMap =>
  v && typeof v === "object" ? (v as TokenMap) : EMPTY;

/**
 * Keeps the guest tokens of orders placed on this device in localStorage.
 * Guests have no account, so the token returned by O-1 is the only way to
 * open or cancel that order again (`customer_order.guest_token`).
 *
 * @returns `tokenFor(orderId)` to read a token (undefined when unknown) and
 *   `save(orderId, token)` to remember one
 */
export function useGuestOrders() {
  const [tokens, setTokens] = useLocalStorage<TokenMap>(
    "coffee-guest-orders",
    EMPTY,
    parse,
  );
  return {
    tokenFor: (orderId: number): string | undefined => tokens[orderId],
    save: (orderId: number, token: string) =>
      setTokens((prev) => ({ ...prev, [orderId]: token })),
  };
}
