"use client";

import ShiftCard from "@/components/molecules/cards/ShiftCard";
import { DEPARTMENTS } from "@/lib/constants";
import { useShift } from "@/lib/shift-context";
import { useMemo, useState } from "react";

import type { WeeklyScheduleProps } from "./ShiftSchedule.types";

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DAY_LABELS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDateShort(d: Date): string {
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

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

export default function WeeklySchedule({
  onShiftClick,
  onCreateShift,
  mobileCalendarHeader = false,
}: WeeklyScheduleProps) {
  const {
    currentDate,
    getWeekDates,
    getShiftsForDate,
    goToNextWeek,
    goToPrevWeek,
  } = useShift();
  const weekDates = getWeekDates();

  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateISO(weekDates[0] ?? currentDate),
  );

  const statusDotsByDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    weekDates.forEach((date) => {
      const dateStr = formatDateISO(date);
      const dayShifts = getShiftsForDate(dateStr);
      const dots: string[] = [];
      if (dayShifts.some((s) => s.status === "available"))
        dots.push("bg-sky-300");
      if (dayShifts.some((s) => s.status === "registered"))
        dots.push("bg-blue-600");
      if (dayShifts.some((s) => s.status === "approved_leave"))
        dots.push("bg-purple-400");
      if (dayShifts.some((s) => s.status === "absent"))
        dots.push("bg-rose-400");
      map[dateStr] = dots.slice(0, 3);
    });
    return map;
  }, [weekDates, getShiftsForDate]);

  const selectedDateObj = useMemo(() => {
    const inWeek = weekDates.find((d) => formatDateISO(d) === selectedDate);
    return inWeek ?? weekDates[0] ?? currentDate;
  }, [selectedDate, weekDates, currentDate]);

  const selectedDateStr = formatDateISO(selectedDateObj);

  const renderMobileDayView = mobileCalendarHeader && (
    <div className="space-y-3">
      <div className="rounded-xl border border-(--color-border-light) bg-white p-3">
        <div className="mb-3 flex items-center justify-between">
          <button
            title="Tuần trước"
            type="button"
            onClick={goToPrevWeek}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-(--color-text-muted) transition hover:bg-gray-100"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <h3 className="text-base font-bold text-(--color-primary-dark)">
            {MONTH_NAMES_EN[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            title="Tuần sau"
            type="button"
            onClick={goToNextWeek}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-(--color-text-muted) transition hover:bg-gray-100"
          >
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((date, i) => {
            const dateStr = formatDateISO(date);
            const active = dateStr === selectedDateStr;
            const dots = statusDotsByDate[dateStr] ?? [];
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-none p-1 ${
                  active ? "bg-(--color-primary)/10" : "bg-transparent"
                }`}
              >
                <span
                  className={`text-xs font-medium ${i >= 5 ? "text-pink-500" : "text-(--color-primary-dark)"}`}
                >
                  {DAY_LABELS_EN[i]}
                </span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                    active || isToday(date)
                      ? "bg-indigo-500 text-white"
                      : i >= 5
                        ? "text-pink-500"
                        : "text-sky-500"
                  }`}
                >
                  {date.getDate()}
                </span>
                <div className="flex min-h-2 items-center gap-0.5">
                  {dots.map((dot, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 w-1.5 rounded-full ${dot}`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {DEPARTMENTS.map((dept) => {
          const deptShifts = getShiftsForDate(selectedDateStr).filter(
            (s) => s.department === dept.id,
          );
          if (deptShifts.length === 0 && !onCreateShift) return null;
          return (
            <div
              key={dept.id}
              className="rounded-xl border border-(--color-border-light) bg-white p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <i
                  className={`${dept.icon} text-xs text-(--color-primary)`}
                ></i>
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
                {onCreateShift && (
                  <button
                    type="button"
                    onClick={() => onCreateShift(selectedDateStr)}
                    className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-transparent py-2 text-xs text-gray-400 transition hover:border-(--color-primary) hover:text-(--color-primary)"
                  >
                    <i className="fa-solid fa-plus mr-1"></i>
                    Thêm ca
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (mobileCalendarHeader) {
    return renderMobileDayView ?? null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-225 border-collapse">
        <thead>
          <tr>
            <th className="w-28 border-r border-b border-(--color-border-light) bg-gray-50 px-3 py-3 text-left text-xs font-semibold text-(--color-text-muted) uppercase">
              Bộ phận
            </th>
            {weekDates.map((date, i) => (
              <th
                key={i}
                className={`border-r border-b border-(--color-border-light) px-2 py-3 text-center text-xs ${
                  isToday(date)
                    ? "bg-(--color-primary)/10 font-bold text-(--color-primary)"
                    : "bg-gray-50 font-semibold text-(--color-text-muted)"
                }`}
              >
                <span className="block uppercase">{DAY_LABELS[i]}</span>
                <span className="mt-0.5 block text-[11px] font-normal">
                  {formatDateShort(date)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DEPARTMENTS.map((dept) => (
            <tr key={dept.id}>
              <td className="border-r border-b border-(--color-border-light) bg-gray-50/50 px-3 py-3 align-top">
                <div className="flex items-center gap-2">
                  <i
                    className={`${dept.icon} text-xs text-(--color-primary)`}
                  ></i>
                  <span className="text-xs font-semibold text-(--color-text-secondary)">
                    {dept.name}
                  </span>
                </div>
              </td>
              {weekDates.map((date, i) => {
                const dateStr = formatDateISO(date);
                const shifts = getShiftsForDate(dateStr).filter(
                  (s) => s.department === dept.id,
                );
                return (
                  <td
                    key={i}
                    className={`border-r border-b border-(--color-border-light) p-1.5 align-top ${
                      isToday(date) ? "bg-(--color-primary)/5" : ""
                    }`}
                  >
                    <div className="flex min-h-20 flex-col gap-1">
                      {shifts.map((shift) => (
                        <ShiftCard
                          key={shift.id}
                          shift={shift}
                          compact
                          onClick={onShiftClick}
                        />
                      ))}
                      {onCreateShift && (
                        <button
                          type="button"
                          onClick={() => onCreateShift(dateStr)}
                          className="mt-auto flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-transparent py-1 text-[10px] text-gray-400 transition hover:border-(--color-primary) hover:text-(--color-primary)"
                        >
                          <i className="fa-solid fa-plus mr-1"></i>
                          Thêm ca
                        </button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
