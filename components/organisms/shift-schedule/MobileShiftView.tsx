"use client";

import ShiftCard from "@/components/molecules/cards/ShiftCard";
import { DEPARTMENTS } from "@/lib/constants";
import { useShift } from "@/lib/shift-context";
import { useMemo, useState } from "react";

import type { MobileShiftViewProps } from "./ShiftSchedule.types";

const DAY_HEADERS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isToday(d: Date): boolean {
  const today = new Date(2026, 3, 10);
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

export default function MobileShiftView({ onShiftClick }: MobileShiftViewProps) {
  const { currentDate, shifts, goToNextMonth, goToPrevMonth } = useShift();
  const [selectedDate, setSelectedDate] = useState<string>(formatDateISO(new Date(2026, 3, 10)));

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
    if (dayShifts.some((s) => s.status === "available")) dots.push("bg-amber-400");
    if (dayShifts.some((s) => s.status === "registered")) dots.push("bg-green-500");
    if (dayShifts.some((s) => s.status === "approved_leave")) dots.push("bg-purple-400");
    if (dayShifts.some((s) => s.status === "absent")) dots.push("bg-red-400");
    return dots;
  };

  const selectedShifts = useMemo(() => {
    return shifts.filter((s) => s.date === selectedDate);
  }, [shifts, selectedDate]);

  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const dayOfWeek = DAY_HEADERS[(selectedDateObj.getDay() + 6) % 7];

  return (
    <div className="space-y-4">
      {/* Compact month calendar */}
      <div className="rounded-xl border border-(--color-border-light) bg-white p-3">
        {/* Month navigation */}
        <div className="mb-3 flex items-center justify-between">
          <button
            title="Trở lại tháng trước"
            type="button"
            onClick={goToPrevMonth}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-(--color-text-muted) transition hover:bg-gray-100"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <h3 className="text-sm font-bold text-foreground">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            title="Trở lại tháng sau"
            type="button"
            onClick={goToNextMonth}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-(--color-text-muted) transition hover:bg-gray-100"
          >
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-1 grid grid-cols-7">
          {DAY_HEADERS.map((day) => (
            <div key={day} className="py-1 text-center text-[10px] font-semibold text-(--color-text-muted) uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
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
                        ? "font-bold text-foreground"
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

        {/* Legend */}
        <div className="mt-3 flex flex-wrap justify-center gap-3 border-t border-(--color-border-light) pt-2">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span className="text-[10px] text-(--color-text-muted)">Còn trống</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-[10px] text-(--color-text-muted)">Đã ĐK</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-purple-400"></span>
            <span className="text-[10px] text-(--color-text-muted)">Nghỉ phép</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400"></span>
            <span className="text-[10px] text-(--color-text-muted)">Vắng</span>
          </div>
        </div>
      </div>

      {/* Selected day shifts */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-foreground">
          {dayOfWeek}, {selectedDateObj.getDate()}/{selectedDateObj.getMonth() + 1}/{selectedDateObj.getFullYear()}
          <span className="ml-2 text-xs font-normal text-(--color-text-muted)">
            ({selectedShifts.length} ca)
          </span>
        </h3>

        {selectedShifts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-(--color-border-light) py-8 text-center">
            <i className="fa-regular fa-calendar-xmark mb-2 text-2xl text-gray-300"></i>
            <p className="text-sm text-(--color-text-muted)">Không có ca làm trong ngày này</p>
          </div>
        ) : (
          <div className="space-y-3">
            {DEPARTMENTS.map((dept) => {
              const deptShifts = selectedShifts.filter((s) => s.department === dept.id);
              if (deptShifts.length === 0) return null;
              return (
                <div key={dept.id}>
                  <div className="mb-2 flex items-center gap-2">
                    <i className={`${dept.icon} text-xs text-(--color-primary)`}></i>
                    <span className="text-xs font-semibold text-(--color-text-secondary)">
                      {dept.name}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {deptShifts.map((shift) => (
                      <ShiftCard key={shift.id} shift={shift} onClick={onShiftClick} />
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
