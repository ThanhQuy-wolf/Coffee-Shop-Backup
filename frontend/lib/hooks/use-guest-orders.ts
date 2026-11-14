"use client";

import { useLocalStorage } from "./use-local-storage";

type TokenMap = Record<string, string>;

const EMPTY: TokenMap = {};
const parse = (v: unknown): TokenMap =>
  v && typeof v === "object" ? (v as TokenMap) : EMPTY;

/**
 * Guests have no account, so the guest token returned by O-1 is kept on the
 * device to open or cancel that order again (customer_order.guest_token).
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
