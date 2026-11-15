"use client";

import { Icon } from "@/components/atoms";
import { ShiftCard } from "@/components/molecules/cards";
import { useShift } from "@/lib/contexts/shift-context";
import {
  MONTH_NAMES_VI,
  WEEKDAY_LABELS_VI,
  formatDateISO,
  formatDateShort,
  isToday,
} from "@/lib/utils/date";
import { useMemo, useState } from "react";

import type { WeeklyScheduleProps } from "./ShiftSchedule.types";

/**
 * Week view of the schedule with one row per department. On phones it shows
 * a week strip and the shifts of the selected day instead.
 * @param props.onShiftClick Called when a shift card is clicked.
 * @param props.onCreateShift Shows a "+" per day and department when given.
 * @param props.mobileCalendarHeader Use the phone layout.
 */
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
    departments,
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
      if (dayShifts.some((s) => s.view === "available"))
        dots.push("bg-sky-300");
      if (dayShifts.some((s) => s.view === "registered"))
        dots.push("bg-blue-600");
      if (dayShifts.some((s) => s.view === "leave_requested"))
        dots.push("bg-amber-400");
      if (dayShifts.some((s) => s.view === "approved_leave"))
        dots.push("bg-purple-400");
      if (dayShifts.some((s) => s.view === "absent")) dots.push("bg-rose-400");
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
            aria-label="Tuần trước"
            type="button"
            onClick={goToPrevWeek}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-(--color-text-muted) transition hover:bg-gray-100"
          >
            <Icon name="chevron-left" className="text-xs" />
          </button>
          <h3 className="text-base font-bold text-(--color-primary-dark)">
            {MONTH_NAMES_VI[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            title="Tuần sau"
            aria-label="Tuần sau"
            type="button"
            onClick={goToNextWeek}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-(--color-text-muted) transition hover:bg-gray-100"
          >
            <Icon name="chevron-right" className="text-xs" />
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
                  {WEEKDAY_LABELS_VI[i]}
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
        {departments.map((dept) => {
          const deptShifts = getShiftsForDate(selectedDateStr).filter(
            (s) => s.departmentId === dept.id,
          );
          if (deptShifts.length === 0 && !onCreateShift) return null;
          return (
            <div
              key={dept.id}
              className="rounded-xl border border-(--color-border-light) bg-white p-3"
            >
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
                {onCreateShift && (
                  <button
                    type="button"
                    onClick={() => onCreateShift(selectedDateStr)}
                    className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-transparent py-2 text-xs text-gray-400 transition hover:border-(--color-primary) hover:text-(--color-primary)"
                  >
                    <Icon name="plus" className="mr-1" />
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
                <span className="block uppercase">{WEEKDAY_LABELS_VI[i]}</span>
                <span className="mt-0.5 block text-[11px] font-normal">
                  {formatDateShort(date)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id}>
              <td className="border-r border-b border-(--color-border-light) bg-gray-50/50 px-3 py-3 align-top">
                <div className="flex items-center gap-2">
                  <Icon
                    name={dept.icon}
                    className="text-xs text-(--color-primary)"
                  />
                  <span className="text-xs font-semibold text-(--color-text-secondary)">
                    {dept.name}
                  </span>
                </div>
              </td>
              {weekDates.map((date, i) => {
                const dateStr = formatDateISO(date);
                const shifts = getShiftsForDate(dateStr).filter(
                  (s) => s.departmentId === dept.id,
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
                          <Icon name="plus" className="mr-1" />
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
