"use client";

import {
  type ShiftViewStatus,
  isSeatHolder,
} from "@/lib/contexts/shift-context";
import { formatNumber } from "@/lib/utils/currency";

import type { ShiftCardProps } from "./ShiftCard.types";

/** Card colours, badge colours and label for each shift state. */
export const SHIFT_VIEW_STYLES: Record<
  ShiftViewStatus,
  { card: string; badge: string; label: string }
> = {
  available: {
    card: "bg-blue-50 border-blue-200 text-blue-700",
    badge: "bg-blue-200 text-blue-800",
    label: "Còn trống",
  },
  full: {
    card: "bg-gray-50 border-gray-200 text-gray-600",
    badge: "bg-gray-200 text-gray-700",
    label: "Đủ người",
  },
  registered: {
    card: "bg-blue-100 border-blue-400 text-blue-900",
    badge: "bg-blue-300 text-blue-900",
    label: "Đã đăng ký",
  },
  leave_requested: {
    card: "bg-(--color-warning-bg) border-(--color-warning)/30 text-(--color-warning)",
    badge: "bg-amber-200 text-(--color-warning)",
    label: "Chờ duyệt nghỉ",
  },
  approved_leave: {
    card: "bg-purple-50 border-purple-300 text-purple-700",
    badge: "bg-purple-200 text-purple-800",
    label: "Nghỉ phép",
  },
  attended: {
    card: "bg-(--color-success-bg) border-(--color-success)/30 text-(--color-success)",
    badge: "bg-green-200 text-(--color-success)",
    label: "Có mặt",
  },
  absent: {
    card: "bg-(--color-danger-bg) border-(--color-danger)/30 text-(--color-danger)",
    badge: "bg-red-200 text-(--color-danger)",
    label: "Vắng mặt",
  },
};

/**
 * Short wage label for the cards, e.g. 120000 → "120k".
 * @param wage Wage per shift in VND.
 */
function formatWage(wage: number): string {
  return wage >= 1000 ? `${(wage / 1000).toFixed(0)}k` : formatNumber(wage);
}

/**
 * Clickable shift card coloured by the shift's state for the viewer. The full
 * card lists who is in the shift; the compact one only shows time, seats and
 * wage, for the month calendar.
 * @param props.shift The shift as seen by the current user.
 * @param props.compact Use the small layout.
 * @param props.onClick Called with the shift when the card is clicked.
 */
export default function ShiftCard({
  shift,
  compact = false,
  onClick,
}: ShiftCardProps) {
  const style = SHIFT_VIEW_STYLES[shift.view];
  const holders = shift.assignments.filter((a) => isSeatHolder(a.status));

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onClick?.(shift)}
        className={`w-full cursor-pointer rounded-lg border px-2 py-1.5 text-left text-xs transition-shadow hover:shadow-sm ${style.card}`}
      >
        <p className="font-semibold">
          {shift.startTime} – {shift.endTime}
        </p>
        <p className="mt-0.5 opacity-75">
          {shift.occupied}/{shift.maxStaff} · {formatWage(shift.wage)}
        </p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick?.(shift)}
      className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-shadow hover:shadow-md ${style.card}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold">
            {shift.startTime} – {shift.endTime}
          </p>
          <p className="mt-1 text-xs opacity-75">
            {shift.durationHours}h · {formatWage(shift.wage)} VND
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}
        >
          {style.label}
        </span>
      </div>

      {holders.length > 0 ? (
        <div className="mt-2 border-t border-current/10 pt-2">
          <p className="text-[10px] font-medium tracking-wide uppercase opacity-60">
            Nhân viên ({shift.occupied}/{shift.maxStaff})
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {holders.map((a) => (
              <span
                key={a.id}
                className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium"
              >
                {a.staffName}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[10px] italic opacity-50">
          {shift.maxStaff} vị trí còn trống
        </p>
      )}
    </button>
  );
}
