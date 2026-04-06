// ─── Analytics Helper Utilities ───────────────────────────────────────────────

/**
 * Format a number as a short Vietnamese currency string.
 * e.g. 1_500_000 → "1.5 tr", 25_000 → "25 k"
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + " tỷ";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + " tr";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + " k";
  return value.toLocaleString("vi-VN") + "đ";
}

/**
 * Format a number as a full Vietnamese currency string.
 * e.g. 25_000 → "25.000đ"
 */
export function formatCurrencyFull(value: number): string {
  return value.toLocaleString("vi-VN") + "đ";
}

/**
 * Calculate period-over-period change between two values.
 */
export function calcChange(current: number, previous: number) {
  const change = current - previous;
  const changePercent = previous === 0 ? 0 : (change / previous) * 100;
  return { change, changePercent, isPositive: change >= 0 };
}
