import type { StatusBadgeProps } from "./Manager.types";

/**
 * Sale status pill: on sale, paused, or missing a component (combos only).
 * @param props.available Whether the item is switched on.
 * @param props.blocked Combo that is on but contains a product that is off.
 */
export default function StatusBadge({
  available,
  blocked = false,
}: StatusBadgeProps) {
  const [label, tone, dot] = !available
    ? [
        "Tạm ngừng bán",
        "bg-(--color-warning-bg) text-(--color-warning)",
        "bg-amber-500",
      ]
    : blocked
      ? [
          "Thiếu món thành phần",
          "bg-(--color-danger-bg) text-(--color-danger)",
          "bg-(--color-danger)",
        ]
      : [
          "Đang bán",
          "bg-(--color-success-bg) text-(--color-success)",
          "bg-emerald-500",
        ];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
