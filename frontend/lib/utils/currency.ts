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
  // Vietnamese uses a decimal comma: "313,2 tr", not "313.2 tr".
  const short = (n: number) =>
    n.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
  if (value >= 1_000_000_000) return short(value / 1_000_000_000) + " tỷ";
  if (value >= 1_000_000) return short(value / 1_000_000) + " tr";
  if (value >= 1_000) return short(Math.round(value / 1_000)) + " nghìn";
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
