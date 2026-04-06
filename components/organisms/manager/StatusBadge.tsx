import type { StatusBadgeProps } from "./Manager.types";

export default function StatusBadge({ available }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        available
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          available ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {available ? "Còn hàng" : "Tạm hết"}
    </span>
  );
}
