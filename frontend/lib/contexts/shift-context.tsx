"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { analyticsService } from "../services/analytics";
import { OCCUPYING_STATUSES, shiftService } from "../services/shifts";
import type { Department, Shift, ShiftInput, User } from "../types";
import {
  SCHEDULE_TODAY,
  formatDateISO,
  getMonday,
  getWeekDates as getWeekDatesOf,
  timeToMinutes,
} from "../utils/date";
import { errorMessage } from "../utils/errors";

export type ScheduleView = "week" | "month";

/** How a shift looks to the person viewing the schedule */
export type ShiftViewStatus =
  | "available"
  | "full"
  | "registered"
  | "leave_requested"
  | "approved_leave"
  | "attended"
  | "absent";

export interface ShiftView extends Shift {
  view: ShiftViewStatus;
  durationHours: number;
}

function toView(shift: Shift, user: User | null): ShiftView {
  const mine = shift.assignments.find((a) => a.staffId === user?.id);
  let view: ShiftViewStatus = shift.remaining > 0 ? "available" : "full";
  if (mine) {
    view = (
      {
        REGISTERED: "registered",
        LEAVE_REQUESTED: "leave_requested",
        LEAVE_APPROVED: "approved_leave",
        ATTENDED: "attended",
        ABSENT: "absent",
        CANCELLED: view,
      } as const
    )[mine.status];
  } else if (
    user?.role === "MANAGER" &&
    shift.assignments.some((a) => a.status === "LEAVE_REQUESTED")
  ) {
    view = "leave_requested";
  }
  return {
    ...shift,
    view,
    durationHours:
      (timeToMinutes(shift.endTime) - timeToMinutes(shift.startTime)) / 60,
  };
}

export const isSeatHolder = (status: Shift["assignments"][number]["status"]) =>
  OCCUPYING_STATUSES.includes(status);

interface ShiftContextType {
  shifts: ShiftView[];
  departments: Department[];
  isLoading: boolean;
  loadError: string | null;
  view: ScheduleView;
  setView: (view: ScheduleView) => void;

  currentDate: Date;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToToday: () => void;

  /** Each action rejects with the ApiError; the schedule is reloaded either way. */
  register: (shiftId: number) => Promise<void>;
  unregister: (shiftId: number) => Promise<void>;
  requestLeave: (assignmentId: number, reason: string) => Promise<void>;
  decideLeave: (assignmentId: number, approve: boolean) => Promise<void>;
  markAttendance: (
    assignmentId: number,
    status: "ATTENDED" | "ABSENT",
  ) => Promise<void>;
  removeAssignment: (assignmentId: number) => Promise<void>;
  createShift: (input: ShiftInput) => Promise<void>;
  updateShift: (
    id: number,
    input: ShiftInput,
    version: number,
  ) => Promise<void>;
  cancelShift: (id: number, reason: string, version: number) => Promise<void>;

  getShift: (id: number) => ShiftView | undefined;
  getShiftsForDate: (date: string) => ShiftView[];
  getWeekDates: () => Date[];
  /** Labour cost of the visible week (BR-52), managers only */
  weeklyLaborCost: number | null;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

/** Visible range: the whole month plus the weeks that overlap it. */
function rangeFor(date: Date) {
  const first = getMonday(new Date(date.getFullYear(), date.getMonth(), 1));
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const lastSunday = new Date(getMonday(last));
  lastSunday.setDate(lastSunday.getDate() + 6);
  const weekEnd = new Date(getMonday(date));
  weekEnd.setDate(weekEnd.getDate() + 6);
  return {
    from: formatDateISO(first < getMonday(date) ? first : getMonday(date)),
    to: formatDateISO(lastSunday > weekEnd ? lastSunday : weekEnd),
  };
}

export function ShiftProvider({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  const shopId = user.shopId!;
  const isManager = user.role === "MANAGER";
  const [rawShifts, setRawShifts] = useState<Shift[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [weeklyLaborCost, setWeeklyLaborCost] = useState<number | null>(null);
  const [view, setView] = useState<ScheduleView>("week");
  const [currentDate, setCurrentDate] = useState<Date>(
    () => new Date(SCHEDULE_TODAY),
  );

  const { from, to } = rangeFor(currentDate);
  const weekStartIso = formatDateISO(getMonday(currentDate));

  const reload = useCallback(async () => {
    try {
      const [shifts, deps] = await Promise.all([
        shiftService.listShifts(shopId, { from, to }),
        shiftService.listDepartments(shopId),
      ]);
      setRawShifts(shifts);
      setDepartments(deps);
      setLoadError(null);
      if (isManager) {
        const report = await analyticsService.getLaborCost(
          shopId,
          new Date(`${weekStartIso}T00:00:00`),
        );
        setWeeklyLaborCost(report.total);
      }
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [shopId, from, to, isManager, weekStartIso]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const shift = (days: number, months = 0) =>
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + months);
      next.setDate(next.getDate() + days);
      return next;
    });

  const shifts = useMemo(
    () =>
      rawShifts.filter((s) => s.status === "OPEN").map((s) => toView(s, user)),
    [rawShifts, user],
  );

  const run =
    <A extends unknown[]>(fn: (...args: A) => Promise<unknown>) =>
    async (...args: A) => {
      try {
        await fn(...args);
      } finally {
        await reload();
      }
    };

  const value: ShiftContextType = {
    shifts,
    departments,
    isLoading,
    loadError,
    view,
    setView,
    currentDate,
    goToNextWeek: () => shift(7),
    goToPrevWeek: () => shift(-7),
    goToNextMonth: () => shift(0, 1),
    goToPrevMonth: () => shift(0, -1),
    goToToday: () => setCurrentDate(new Date(SCHEDULE_TODAY)),
    register: run(shiftService.register),
    unregister: run(shiftService.unregister),
    requestLeave: run(shiftService.requestLeave),
    decideLeave: run(shiftService.decideLeave),
    markAttendance: run(shiftService.markAttendance),
    removeAssignment: run(shiftService.removeAssignment),
    createShift: run((input: ShiftInput) =>
      shiftService.createShift(shopId, input),
    ),
    updateShift: run((id: number, input: ShiftInput, version: number) =>
      shiftService.updateShift(id, { ...input, version }),
    ),
    cancelShift: run((id: number, reason: string, version: number) =>
      shiftService.cancelShift(id, { reason, version }),
    ),
    getShift: (id) => shifts.find((s) => s.id === id),
    getShiftsForDate: (date) => shifts.filter((s) => s.date === date),
    getWeekDates: () => getWeekDatesOf(currentDate),
    weeklyLaborCost,
  };

  return (
    <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>
  );
}

export function useShift() {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error("useShift must be used within a ShiftProvider");
  }
  return context;
}
