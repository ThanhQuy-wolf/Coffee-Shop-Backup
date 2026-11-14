const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const numberFormatter = new Intl.NumberFormat("vi-VN");

/**
 * Formats an amount of money in full, Vietnamese style.
 *
 * @param value - amount in đồng (integer, A-8)
 * @returns e.g. `25000` → `"25.000 ₫"`
 */
export function formatVND(value: number): string {
  return vndFormatter.format(value);
}

/**
 * Formats an amount of money in a short form for charts and KPI cards.
 *
 * @param value - amount in đồng
 * @returns e.g. `1_500_000` → `"1.5 tr"`, `25_000` → `"25 k"`, `800` → `"800đ"`
 */
export function formatVNDShort(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + " tỷ";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + " tr";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + " k";
  return formatNumber(value) + "đ";
}

/**
 * Formats a plain number with Vietnamese thousand separators.
 *
 * @param value - any number, e.g. a count of cups
 * @returns e.g. `12500` → `"12.500"`
 */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}
