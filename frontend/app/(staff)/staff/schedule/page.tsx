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
import {
  ShiftProvider,
  type ShiftView,
  useShift,
} from "@/lib/contexts/shift-context";
import { useState } from "react";

type FormState = { date?: string; shift?: ShiftView } | null;

export default function StaffSchedulePage() {
  const { user } = useAuth();
  // RoleGuard in the layout guarantees a logged-in staff member here
  return (
    <ShiftProvider user={user!}>
      <Schedule />
    </ShiftProvider>
  );
}

function Schedule() {
  const { user } = useAuth();
  const { view, loadError } = useShift();

  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(null);

  const isManager = user?.role === "MANAGER";
  const openShift = (shift: ShiftView) => setSelectedShiftId(shift.id);
  const openCreate = (date?: string) => setForm({ date });

  return (
    <div className="flex min-h-screen">
      <ScheduleSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <ScheduleHeader
          onCreateShift={isManager ? () => openCreate() : undefined}
        />

        <main className="flex-1 p-4 md:p-6">
          {loadError && (
            <div
              role="alert"
              className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {loadError}
            </div>
          )}

          <div className="hidden md:block">
            {view === "week" ? (
              <WeeklySchedule
                onShiftClick={openShift}
                onCreateShift={isManager ? openCreate : undefined}
              />
            ) : (
              <MonthlyCalendar
                onDateSelect={isManager ? openCreate : undefined}
              />
            )}
          </div>

          <div className="md:hidden">
            {view === "week" ? (
              <WeeklySchedule
                onShiftClick={openShift}
                onCreateShift={isManager ? openCreate : undefined}
                mobileCalendarHeader
              />
            ) : (
              <MobileShiftView onShiftClick={openShift} />
            )}
          </div>

          {isManager && (
            <button
              title="Tạo ca"
              type="button"
              onClick={() => openCreate()}
              className="fixed right-4 bottom-4 z-30 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-none bg-(--color-primary) text-white shadow-lg transition hover:opacity-90 md:hidden"
            >
              <i className="fa-solid fa-plus text-lg"></i>
            </button>
          )}
        </main>
      </div>

      {selectedShiftId !== null && (
        <ShiftDetailModal
          key={selectedShiftId}
          shiftId={selectedShiftId}
          onClose={() => setSelectedShiftId(null)}
          onEdit={(shift) => {
            setSelectedShiftId(null);
            setForm({ shift });
          }}
        />
      )}
      {form && (
        <ShiftCreateModal
          onClose={() => setForm(null)}
          defaultDate={form.date}
          shift={form.shift}
        />
      )}
    </div>
  );
}
