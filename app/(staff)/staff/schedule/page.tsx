"use client";

import MobileShiftView from "@/components/organisms/shift-schedule/MobileShiftView";
import MonthlyCalendar from "@/components/organisms/shift-schedule/MonthlyCalendar";
import ShiftCreateModal from "@/components/organisms/shift-schedule/ShiftCreateModal";
import ShiftDetailModal from "@/components/organisms/shift-schedule/ShiftDetailModal";
import WeeklySchedule from "@/components/organisms/shift-schedule/WeeklySchedule";
import { useAuth } from "@/lib/auth-context";
import { useShift } from "@/lib/shift-context";
import type { ShiftSlot } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

function formatDateShort(d: Date): string {
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

export default function StaffSchedulePage() {
  const { user, logout } = useAuth();
  const {
    view,
    setView,
    currentDate,
    goToNextWeek,
    goToPrevWeek,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    getWeeklyBudget,
  } = useShift();

  const [selectedShift, setSelectedShift] = useState<ShiftSlot | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState<string | undefined>();

  const isManager = user?.role === "manager";

  const handleShiftClick = (shift: ShiftSlot) => {
    setSelectedShift(shift);
    setDetailOpen(true);
  };

  const handleCreateShift = (date: string) => {
    setCreateDate(date);
    setCreateOpen(true);
  };

  const handleDateSelect = (date: string) => {
    // In month view on desktop, clicking a date could open create modal for managers
    if (isManager) {
      setCreateDate(date);
      setCreateOpen(true);
    }
  };

  // Week range label
  const monday = getMonday(currentDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekLabel = `${formatDateShort(monday)} – ${formatDateShort(sunday)}`;

  const weeklyBudget = getWeeklyBudget();

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-(--color-border-light) bg-white shadow-sm lg:flex">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-(--color-border-light) px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-primary)">
            <i className="fa-solid fa-calendar-days text-sm text-white"></i>
          </div>
          <div>
            <p className="text-foreground text-sm font-bold">Lịch làm việc</p>
            <p className="text-xs text-(--color-text-muted)">
              {isManager ? "Manager" : "Staff"}
            </p>
          </div>
        </div>

        {/* View toggle */}
        <nav className="flex-1 space-y-1 p-3">
          <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
            Chế độ xem
          </p>
          <button
            type="button"
            onClick={() => setView("week")}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3 py-2.5 text-sm font-medium transition-all ${
              view === "week"
                ? "bg-(--color-primary) text-white shadow-sm"
                : "hover:bg-background bg-transparent text-(--color-text-secondary) hover:text-(--color-primary-dark)"
            }`}
          >
            <i className="fa-solid fa-table-columns w-4 text-center"></i>
            <span className="flex-1 text-left">Theo tuần</span>
          </button>
          <button
            type="button"
            onClick={() => setView("month")}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3 py-2.5 text-sm font-medium transition-all ${
              view === "month"
                ? "bg-(--color-primary) text-white shadow-sm"
                : "hover:bg-background bg-transparent text-(--color-text-secondary) hover:text-(--color-primary-dark)"
            }`}
          >
            <i className="fa-solid fa-calendar w-4 text-center"></i>
            <span className="flex-1 text-left">Theo tháng</span>
          </button>

          {/* Quick nav */}
          <div className="mt-3 border-t border-(--color-border-light) pt-3">
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
              Điều hướng
            </p>
            <button
              type="button"
              onClick={goToToday}
              className="hover:bg-background flex w-full cursor-pointer items-center gap-3 rounded-xl border-none bg-transparent px-3 py-2.5 text-sm font-medium text-(--color-text-secondary) transition-all hover:text-(--color-primary-dark)"
            >
              <i className="fa-solid fa-crosshairs w-4 text-center"></i>
              <span className="flex-1 text-left">Hôm nay</span>
            </button>
          </div>

          {/* Manager link */}
          {isManager && (
            <div className="mt-3 border-t border-(--color-border-light) pt-3">
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
                Quản lý
              </p>
              <Link
                href="/manager"
                className="hover:bg-background flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-(--color-text-secondary) no-underline transition-all hover:text-(--color-primary-dark)"
              >
                <i className="fa-solid fa-store w-4 text-center"></i>
                <span className="flex-1 text-left">Dashboard</span>
              </Link>
            </div>
          )}

          {/* Weekly budget */}
          <div className="mt-3 border-t border-(--color-border-light) pt-3">
            <div className="rounded-xl bg-(--color-primary)/5 p-3">
              <p className="text-[10px] font-semibold text-(--color-text-muted) uppercase">
                Ngân sách tuần
              </p>
              <p className="mt-1 text-lg font-bold text-(--color-primary)">
                {weeklyBudget.toLocaleString("vi-VN")}
              </p>
              <p className="text-[10px] text-(--color-text-muted)">VND</p>
            </div>
          </div>
        </nav>

        {/* User info */}
        <div className="border-t border-(--color-border-light) p-3">
          <div className="flex items-center gap-3 rounded-xl p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-accent-light)">
              <i className={`fa-solid ${isManager ? "fa-user-tie" : "fa-user"} text-sm text-(--color-primary)`}></i>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-semibold">
                {user?.name ?? "Nhân viên"}
              </p>
              <p className="text-xs text-(--color-text-muted)">
                {isManager ? "Quản lý" : "Nhân viên"}
              </p>
            </div>
          </div>
          <div className="mt-1 flex gap-2 px-1">
            <Link
              href="/"
              className="hover:bg-background flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-(--color-border-light) bg-transparent py-2 text-xs font-medium text-(--color-text-secondary) no-underline transition"
            >
              <i className="fa-solid fa-house"></i>
              Trang chủ
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-transparent py-2 text-xs font-medium text-red-500 transition hover:bg-red-50"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-(--color-border-light) bg-white px-4 py-3 shadow-sm md:px-5 md:py-4">
          <div>
            <h1 className="text-foreground text-base font-bold md:text-lg">
              Đăng ký ca làm
            </h1>
            <p className="text-xs text-(--color-text-muted)">
              {view === "week" ? weekLabel : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
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
            {isManager && (
              <button
                type="button"
                onClick={() => {
                  setCreateDate(undefined);
                  setCreateOpen(true);
                }}
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

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          {/* Desktop views */}
          <div className="hidden md:block">
            {view === "week" ? (
              <WeeklySchedule
                onShiftClick={handleShiftClick}
                onCreateShift={isManager ? handleCreateShift : undefined}
              />
            ) : (
              <MonthlyCalendar
                onShiftClick={handleShiftClick}
                onDateSelect={isManager ? handleDateSelect : undefined}
              />
            )}
          </div>

          {/* Mobile view */}
          <div className="md:hidden">
            {view === "week" ? (
              <WeeklySchedule
                onShiftClick={handleShiftClick}
                onCreateShift={isManager ? handleCreateShift : undefined}
                mobileCalendarHeader
              />
            ) : (
              <MobileShiftView onShiftClick={handleShiftClick} />
            )}
          </div>

          {/* Mobile FAB for manager */}
          {isManager && (
            <button
              title="Tạo ca"
              type="button"
              onClick={() => {
                setCreateDate(undefined);
                setCreateOpen(true);
              }}
              className="fixed right-4 bottom-4 z-30 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-none bg-(--color-primary) text-white shadow-lg transition hover:opacity-90 md:hidden"
            >
              <i className="fa-solid fa-plus text-lg"></i>
            </button>
          )}
        </main>
      </div>

      {/* Modals */}
      <ShiftDetailModal
        shift={selectedShift}
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedShift(null);
        }}
      />
      <ShiftCreateModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultDate={createDate}
      />
    </div>
  );
}
