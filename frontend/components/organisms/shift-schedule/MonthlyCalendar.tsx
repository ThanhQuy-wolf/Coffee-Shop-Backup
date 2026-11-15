"use client";

import { useShift } from "@/lib/contexts/shift-context";
import { WEEKDAY_LABELS_VI, formatDateISO, isToday } from "@/lib/utils/date";
import { useMemo } from "react";

import type { MonthlyCalendarProps } from "./ShiftSchedule.types";

/**
 * Month grid starting on Monday, with the number of shifts on each day.
 * @param props.onDateSelect Called with the clicked day as `YYYY-MM-DD`.
 */
export default function MonthlyCalendar({
  onDateSelect,
}: MonthlyCalendarProps) {
  const { currentDate, shifts } = useShift();

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday = 0, Sunday = 6
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const days: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentDate]);

  const getShiftSummary = (date: Date) => {
    const dateStr = formatDateISO(date);
    const dayShifts = shifts.filter((s) => s.date === dateStr);
    const available = dayShifts.filter((s) => s.view === "available").length;
    const registered = dayShifts.filter((s) => s.view === "registered").length;
    const leave = dayShifts.filter(
      (s) => s.view === "approved_leave" || s.view === "leave_requested",
    ).length;
    const absent = dayShifts.filter((s) => s.view === "absent").length;
    return { total: dayShifts.length, available, registered, leave, absent };
  };

  return (
    <div className="overflow-hidden rounded-xl border border-(--color-border-light)">
      <div className="grid grid-cols-7 border-b border-(--color-border-light) bg-gray-50">
        {WEEKDAY_LABELS_VI.map((day) => (
          <div
            key={day}
            className="px-2 py-2.5 text-center text-xs font-semibold text-(--color-text-muted) uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((date, i) => {
          if (!date) {
            return (
              <div
                key={`empty-${i}`}
                className="min-h-25 border-r border-b border-(--color-border-light) bg-gray-50/30"
              />
            );
          }

          const summary = getShiftSummary(date);
          const today = isToday(date);

          return (
            <button
              type="button"
              key={i}
              onClick={() => onDateSelect?.(formatDateISO(date))}
              className={`min-h-25 cursor-pointer border-r border-b border-(--color-border-light) bg-transparent p-2 text-left transition hover:bg-gray-50 ${
                today ? "bg-(--color-primary)/5" : ""
              }`}
            >
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                  today
                    ? "bg-(--color-primary) font-bold text-white"
                    : "text-foreground font-medium"
                }`}
              >
                {date.getDate()}
              </span>

              {summary.total > 0 && (
                <div className="mt-2 space-y-1">
                  {summary.available > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                      <span className="text-[10px] text-blue-600">
                        {summary.available} trống
                      </span>
                    </div>
                  )}
                  {summary.registered > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-700"></span>
                      <span className="text-[10px] text-blue-800">
                        {summary.registered} đã ĐK
                      </span>
                    </div>
                  )}
                  {summary.leave > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-purple-400"></span>
                      <span className="text-[10px] text-purple-600">
                        {summary.leave} nghỉ
                      </span>
                    </div>
                  )}
                  {summary.absent > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-400"></span>
                      <span className="text-[10px] text-(--color-danger)">
                        {summary.absent} vắng
                      </span>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
