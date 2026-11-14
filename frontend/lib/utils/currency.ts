// ─── Currency helpers (VND) ──────────────────────────────────────────────────

const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

/** 25000 → "25.000 ₫" (Intl currency style) */
export function formatVND(value: number): string {
  return vndFormatter.format(value);
}

/** 25000 → "25.000đ" */
export function formatCurrencyFull(value: number): string {
  return value.toLocaleString("vi-VN") + "đ";
}

/** Short form for charts/cards: 1_500_000 → "1.5 tr", 25_000 → "25 k" */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + " tỷ";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + " tr";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + " k";
  return value.toLocaleString("vi-VN") + "đ";
}
