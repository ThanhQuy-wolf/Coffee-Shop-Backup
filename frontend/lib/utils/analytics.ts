// ─── Analytics Helper Utilities ───────────────────────────────────────────────

// Currency formatters now live in lib/utils/currency; re-exported for callers.
export { formatCurrency, formatCurrencyFull } from "./currency";

/**
 * Calculate period-over-period change between two values.
 */
export function calcChange(current: number, previous: number) {
  const change = current - previous;
  const changePercent = previous === 0 ? 0 : (change / previous) * 100;
  return { change, changePercent, isPositive: change >= 0 };
}
