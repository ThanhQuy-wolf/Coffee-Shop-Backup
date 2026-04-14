"use client";

import type { ShiftSlot } from "@/lib/types";

import type { ShiftCardProps } from "./ShiftCard.types";

const STATUS_STYLES: Record<
  ShiftSlot["status"],
  { bg: string; text: string; label: string }
> = {
  available: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    label: "Còn trống",
  },
  registered: {
    bg: "bg-blue-100 border-blue-400",
    text: "text-blue-900",
    label: "Đã đăng ký",
  },
  approved_leave: {
    bg: "bg-purple-50 border-purple-300",
    text: "text-purple-700",
    label: "Nghỉ phép",
  },
  absent: {
    bg: "bg-red-50 border-red-300",
    text: "text-red-700",
    label: "Vắng mặt",
  },
};

function formatWage(wage: number): string {
  if (wage >= 1000) {
    return `${(wage / 1000).toFixed(0)}k`;
  }
  return wage.toLocaleString("vi-VN");
}

export default function ShiftCard({
  shift,
  compact = false,
  onClick,
}: ShiftCardProps) {
  const style = STATUS_STYLES[shift.status];

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onClick?.(shift)}
        className={`w-full cursor-pointer rounded-lg border px-2 py-1.5 text-left text-xs transition-shadow hover:shadow-sm ${style.bg} ${style.text}`}
      >
        <p className="font-semibold">
          {shift.startTime} – {shift.endTime}
        </p>
        <p className="mt-0.5 opacity-75">
          {shift.durationHours}h · {formatWage(shift.wage)}
        </p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick?.(shift)}
      className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-shadow hover:shadow-md ${style.bg} ${style.text}`}
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
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            shift.status === "available"
              ? "bg-blue-200 text-blue-800"
              : shift.status === "registered"
                ? "bg-blue-300 text-blue-900"
                : shift.status === "approved_leave"
                  ? "bg-purple-200 text-purple-800"
                  : "bg-red-200 text-red-800"
          }`}
        >
          {style.label}
        </span>
      </div>

      {shift.registeredStaff.length > 0 && (
        <div className="mt-2 border-t border-current/10 pt-2">
          <p className="text-[10px] font-medium tracking-wide uppercase opacity-60">
            Nhân viên ({shift.registeredStaff.length}/{shift.maxStaff})
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {shift.registeredStaff.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium"
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {shift.status === "available" && shift.registeredStaff.length === 0 && (
        <p className="mt-2 text-[10px] italic opacity-50">
          {shift.maxStaff} vị trí còn trống
        </p>
      )}
    </button>
  );
}
