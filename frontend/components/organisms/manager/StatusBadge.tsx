import type { StatusBadgeProps } from "./Manager.types";

export default function StatusBadge({
  available,
  blocked = false,
}: StatusBadgeProps) {
  const [label, tone, dot] = !available
    ? ["Tạm ngừng bán", "bg-amber-100 text-amber-700", "bg-amber-500"]
    : blocked
      ? ["Thiếu món thành phần", "bg-red-100 text-red-700", "bg-red-500"]
      : ["Đang bán", "bg-emerald-100 text-emerald-700", "bg-emerald-500"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
