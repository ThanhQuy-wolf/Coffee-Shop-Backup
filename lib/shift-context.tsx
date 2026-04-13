"use client";

import { ReactNode, createContext, useCallback, useContext, useState } from "react";

import { MOCK_SHIFT_SLOTS } from "./constants";
import type { ShiftSlot, ShiftStatus } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScheduleView = "week" | "month";

interface ShiftContextType {
  // Data
  shifts: ShiftSlot[];
  view: ScheduleView;
  setView: (view: ScheduleView) => void;

  // Current date navigation
  currentDate: Date;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToToday: () => void;

  // Shift actions
  registerShift: (shiftId: string, staffId: number, staffName: string) => { success: boolean; error?: string };
  unregisterShift: (shiftId: string, staffId: number) => void;
  createShift: (shift: Omit<ShiftSlot, "id">) => void;
  updateShift: (shift: ShiftSlot) => void;
  deleteShift: (shiftId: string) => void;

  // Helpers
  getShiftsForDate: (date: string) => ShiftSlot[];
  getShiftsForWeek: (weekStart: Date) => ShiftSlot[];
  getWeekDates: () => Date[];
  hasConflict: (date: string, startTime: string, endTime: string, staffId: number, excludeShiftId?: string) => boolean;
  getWeeklyBudget: () => number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ShiftProvider({ children }: { children: ReactNode }) {
  const [shifts, setShifts] = useState<ShiftSlot[]>(MOCK_SHIFT_SLOTS);
  const [view, setView] = useState<ScheduleView>("week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 3, 10)); // April 10, 2026

  // ── Navigation ──────────────────────────────────────────────────────────

  const goToNextWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }, []);

  const goToPrevWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date(2026, 3, 10));
  }, []);

  // ── Query helpers ───────────────────────────────────────────────────────

  const getWeekDates = useCallback((): Date[] => {
    const monday = getMonday(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const getShiftsForDate = useCallback(
    (date: string): ShiftSlot[] => {
      return shifts.filter((s) => s.date === date);
    },
    [shifts],
  );

  const getShiftsForWeek = useCallback(
    (weekStart: Date): ShiftSlot[] => {
      const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return formatDate(d);
      });
      return shifts.filter((s) => dates.includes(s.date));
    },
    [shifts],
  );

  const hasConflict = useCallback(
    (
      date: string,
      startTime: string,
      endTime: string,
      staffId: number,
      excludeShiftId?: string,
    ): boolean => {
      return shifts.some(
        (s) =>
          s.date === date &&
          s.id !== excludeShiftId &&
          s.registeredStaff.some((rs) => rs.id === staffId) &&
          timesOverlap(startTime, endTime, s.startTime, s.endTime),
      );
    },
    [shifts],
  );

  const getWeeklyBudget = useCallback((): number => {
    const weekDates = getWeekDates().map(formatDate);
    return shifts
      .filter((s) => weekDates.includes(s.date) && s.registeredStaff.length > 0)
      .reduce((sum, s) => sum + s.wage * s.registeredStaff.length, 0);
  }, [shifts, getWeekDates]);

  // ── Shift actions ───────────────────────────────────────────────────────

  const registerShift = useCallback(
    (
      shiftId: string,
      staffId: number,
      staffName: string,
    ): { success: boolean; error?: string } => {
      const shift = shifts.find((s) => s.id === shiftId);
      if (!shift) return { success: false, error: "Ca làm không tồn tại." };

      if (shift.registeredStaff.length >= shift.maxStaff) {
        return { success: false, error: "Ca làm đã đủ người." };
      }

      if (shift.registeredStaff.some((rs) => rs.id === staffId)) {
        return { success: false, error: "Bạn đã đăng ký ca này rồi." };
      }

      if (hasConflict(shift.date, shift.startTime, shift.endTime, staffId, shiftId)) {
        return {
          success: false,
          error: "Xung đột lịch! Bạn đã có ca làm trùng giờ trong ngày này.",
        };
      }

      setShifts((prev) =>
        prev.map((s) =>
          s.id === shiftId
            ? {
                ...s,
                registeredStaff: [...s.registeredStaff, { id: staffId, name: staffName }],
                status: "registered" as ShiftStatus,
              }
            : s,
        ),
      );

      return { success: true };
    },
    [shifts, hasConflict],
  );

  const unregisterShift = useCallback((shiftId: string, staffId: number) => {
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id !== shiftId) return s;
        const updated = s.registeredStaff.filter((rs) => rs.id !== staffId);
        return {
          ...s,
          registeredStaff: updated,
          status: updated.length === 0 ? ("available" as ShiftStatus) : s.status,
        };
      }),
    );
  }, []);

  const createShift = useCallback((shift: Omit<ShiftSlot, "id">) => {
    const newShift: ShiftSlot = {
      ...shift,
      id: `shift_${Date.now()}`,
    };
    setShifts((prev) => [...prev, newShift]);
  }, []);

  const updateShift = useCallback((shift: ShiftSlot) => {
    setShifts((prev) => prev.map((s) => (s.id === shift.id ? shift : s)));
  }, []);

  const deleteShift = useCallback((shiftId: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
  }, []);

  return (
    <ShiftContext.Provider
      value={{
        shifts,
        view,
        setView,
        currentDate,
        goToNextWeek,
        goToPrevWeek,
        goToNextMonth,
        goToPrevMonth,
        goToToday,
        registerShift,
        unregisterShift,
        createShift,
        updateShift,
        deleteShift,
        getShiftsForDate,
        getShiftsForWeek,
        getWeekDates,
        hasConflict,
        getWeeklyBudget,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useShift() {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error("useShift must be used within a ShiftProvider");
  }
  return context;
}
