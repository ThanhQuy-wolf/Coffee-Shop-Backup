"use client";

import {
  MobileShiftView,
  MonthlyCalendar,
  ScheduleHeader,
  ScheduleSidebar,
  ShiftCreateModal,
  ShiftDetailModal,
  WeeklySchedule,
} from "@/components/organisms/shift-schedule";
import { useAuth } from "@/lib/contexts/auth-context";
import { useShift } from "@/lib/contexts/shift-context";
import type { ShiftSlot } from "@/lib/types";
import { useState } from "react";

export default function StaffSchedulePage() {
  const { user } = useAuth();
  const { view } = useShift();

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

  const openCreateForNewShift = () => {
    setCreateDate(undefined);
    setCreateOpen(true);
  };

  const handleDateSelect = (date: string) => {
    // In month view on desktop, clicking a date could open create modal for managers
    if (isManager) {
      setCreateDate(date);
      setCreateOpen(true);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar (Desktop) ── */}
      <ScheduleSidebar />

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <ScheduleHeader
          onCreateShift={isManager ? openCreateForNewShift : undefined}
        />

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
              onClick={openCreateForNewShift}
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
        // remount on every open so the form starts fresh with defaultDate
        key={createOpen ? (createDate ?? "new") : "closed"}
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultDate={createDate}
      />
    </div>
  );
}
