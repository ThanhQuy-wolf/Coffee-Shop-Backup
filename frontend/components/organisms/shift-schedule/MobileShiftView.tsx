"use client";

import { Icon } from "@/components/atoms";
import { ShiftCard } from "@/components/molecules/cards";
import { useShift } from "@/lib/contexts/shift-context";
import {
  MONTH_NAMES_VI,
  SCHEDULE_TODAY,
  WEEKDAY_LABELS_VI,
  formatDateISO,
  isToday,
} from "@/lib/utils/date";
import { useMemo, useState } from "react";

import type { MobileShiftViewProps } from "./ShiftSchedule.types";

/**
 * Phone layout of the schedule: a month calendar with coloured dots per day,
 * and the shifts of the selected day below it.
 * @param props.onShiftClick Called when a shift card is tapped.
 */
export default function MobileShiftView({
  onShiftClick,
}: MobileShiftViewProps) {
  const { currentDate, shifts, goToNextMonth, goToPrevMonth, departments } =
    useShift();
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateISO(SCHEDULE_TODAY),
  );

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [currentDate]);

  const getDotColors = (date: Date): string[] => {
    const dateStr = formatDateISO(date);
    const dayShifts = shifts.filter((s) => s.date === dateStr);
    const dots: string[] = [];
    if (dayShifts.some((s) => s.view === "available")) dots.push("bg-sky-300");
    if (dayShifts.some((s) => s.view === "leave_requested"))
      dots.push("bg-amber-400");
    if (dayShifts.some((s) => s.view === "registered"))
      dots.push("bg-green-500");
    if (dayShifts.some((s) => s.view === "approved_leave"))
      dots.push("bg-purple-400");
    if (dayShifts.some((s) => s.view === "absent")) dots.push("bg-red-400");
    return dots;
  };

  const selectedShifts = useMemo(() => {
    return shifts.filter((s) => s.date === selectedDate);
  }, [shifts, selectedDate]);

  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const dayOfWeek = WEEKDAY_LABELS_VI[(selectedDateObj.getDay() + 6) % 7];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-(--color-border-light) bg-white p-3">
        <div className="mb-3 flex items-center justify-between">
          <button
            title="Trở lại tháng trước"
            aria-label="Trở lại tháng trước"
            type="button"
            onClick={goToPrevMonth}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-(--color-text-muted) transition hover:bg-gray-100"
          >
            <Icon name="chevron-left" className="text-xs" />
          </button>
          <h3 className="text-foreground text-sm font-bold">
            {MONTH_NAMES_VI[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            title="Trở lại tháng sau"
            aria-label="Trở lại tháng sau"
            type="button"
            onClick={goToNextMonth}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-(--color-text-muted) transition hover:bg-gray-100"
          >
            <Icon name="chevron-right" className="text-xs" />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7">
          {WEEKDAY_LABELS_VI.map((day) => (
            <div
              key={day}
              className="py-1 text-center text-[10px] font-semibold text-(--color-text-muted) uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="p-1" />;
            }

            const dateStr = formatDateISO(date);
            const today = isToday(date);
            const selected = dateStr === selectedDate;
            const dots = getDotColors(date);

            return (
              <button
                type="button"
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex cursor-pointer flex-col items-center border-none bg-transparent p-1 transition ${
                  selected ? "rounded-lg bg-(--color-primary)/10" : ""
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                    today
                      ? "bg-(--color-primary) font-bold text-white"
                      : selected
                        ? "text-foreground font-bold"
                        : "text-foreground"
                  }`}
                >
                  {date.getDate()}
                </span>
                <div className="mt-0.5 flex gap-0.5">
                  {dots.slice(0, 3).map((color, j) => (
                    <span key={j} className={`h-1 w-1 rounded-full ${color}`} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-3 border-t border-(--color-border-light) pt-2">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span className="text-[10px] text-(--color-text-muted)">
              Còn trống
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-[10px] text-(--color-text-muted)">Đã ĐK</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-purple-400"></span>
            <span className="text-[10px] text-(--color-text-muted)">
              Nghỉ phép
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400"></span>
            <span className="text-[10px] text-(--color-text-muted)">Vắng</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-foreground mb-3 text-sm font-bold">
          {dayOfWeek}, {selectedDateObj.getDate()}/
          {selectedDateObj.getMonth() + 1}/{selectedDateObj.getFullYear()}
          <span className="ml-2 text-xs font-normal text-(--color-text-muted)">
            ({selectedShifts.length} ca)
          </span>
        </h3>

        {selectedShifts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-(--color-border-light) py-8 text-center">
            <Icon
              name="calendar-xmark"
              className="mb-2 text-2xl text-gray-300"
            />
            <p className="text-sm text-(--color-text-muted)">
              Không có ca làm trong ngày này
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {departments.map((dept) => {
              const deptShifts = selectedShifts.filter(
                (s) => s.departmentId === dept.id,
              );
              if (deptShifts.length === 0) return null;
              return (
                <div key={dept.id}>
                  <div className="mb-2 flex items-center gap-2">
                    <Icon
                      name={dept.icon}
                      className="text-xs text-(--color-primary)"
                    />
                    <span className="text-xs font-semibold text-(--color-text-secondary)">
                      {dept.name}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {deptShifts.map((shift) => (
                      <ShiftCard
                        key={shift.id}
                        shift={shift}
                        onClick={onShiftClick}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
