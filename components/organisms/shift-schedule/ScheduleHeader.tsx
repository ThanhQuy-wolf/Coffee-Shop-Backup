"use client";

import { useShift } from "@/lib/contexts/shift-context";
import {
  MONTH_NAMES_VI,
  formatDateShort,
  getWeekDates,
} from "@/lib/utils/date";

export interface ScheduleHeaderProps {
  /** Shows the "Tạo ca" button when provided (managers only) */
  onCreateShift?: () => void;
}

/** Sticky header of the shift schedule: title, period label, view toggle, navigation. */
export default function ScheduleHeader({ onCreateShift }: ScheduleHeaderProps) {
  const {
    view,
    setView,
    currentDate,
    goToNextWeek,
    goToPrevWeek,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
  } = useShift();

  const week = getWeekDates(currentDate);
  const weekLabel = `${formatDateShort(week[0])} – ${formatDateShort(week[6])}`;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-(--color-border-light) bg-white px-4 py-3 shadow-sm md:px-5 md:py-4">
      <div>
        <h1 className="text-foreground text-base font-bold md:text-lg">
          Đăng ký ca làm
        </h1>
        <p className="text-xs text-(--color-text-muted)">
          {view === "week"
            ? weekLabel
            : `${MONTH_NAMES_VI[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* View toggle (mobile) */}
        <div className="flex items-center rounded-xl border border-(--color-border-light) lg:hidden">
          <button
            type="button"
            onClick={() => setView("week")}
            className={`cursor-pointer rounded-l-xl border-none px-3 py-2 text-xs font-medium transition ${
              view === "week"
                ? "bg-(--color-primary) text-white"
                : "bg-transparent text-(--color-text-secondary)"
            }`}
          >
            Tuần
          </button>
          <button
            type="button"
            onClick={() => setView("month")}
            className={`cursor-pointer rounded-r-xl border-none px-3 py-2 text-xs font-medium transition ${
              view === "month"
                ? "bg-(--color-primary) text-white"
                : "bg-transparent text-(--color-text-secondary)"
            }`}
          >
            Tháng
          </button>
        </div>

        {/* Navigation arrows */}
        <div className="hidden items-center gap-1 md:flex">
          <button
            title="Về trước"
            type="button"
            onClick={view === "week" ? goToPrevWeek : goToPrevMonth}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-(--color-border-light) bg-transparent text-(--color-text-muted) transition hover:bg-gray-50"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="cursor-pointer rounded-lg border border-(--color-border-light) bg-transparent px-3 py-1.5 text-xs font-medium text-(--color-text-secondary) transition hover:bg-gray-50"
          >
            Hôm nay
          </button>
          <button
            title="Tiếp theo"
            type="button"
            onClick={view === "week" ? goToNextWeek : goToNextMonth}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-(--color-border-light) bg-transparent text-(--color-text-muted) transition hover:bg-gray-50"
          >
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>

        {/* Create shift button (manager only) */}
        {onCreateShift && (
          <button
            type="button"
            onClick={onCreateShift}
            className="hidden cursor-pointer items-center gap-1.5 rounded-xl border-none bg-(--color-primary) px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 md:flex"
          >
            <i className="fa-solid fa-plus"></i>
            Tạo ca
          </button>
        )}

        {/* Mobile nav */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            title="Về trước"
            type="button"
            onClick={view === "week" ? goToPrevWeek : goToPrevMonth}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-(--color-text-muted)"
          >
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <button
            title="Tiếp theo"
            type="button"
            onClick={view === "week" ? goToNextWeek : goToNextMonth}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-(--color-text-muted)"
          >
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
