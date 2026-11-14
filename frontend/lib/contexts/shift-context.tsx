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

/** Layout of the schedule: one week or one month. */
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

/** A shift plus what the schedule needs to draw it for the current user. */
export interface ShiftView extends Shift {
  view: ShiftViewStatus;
  durationHours: number;
}

/**
 * Works out how a shift looks to the viewer: their own assignment status if
 * they are in it, otherwise free or full. Managers also see "leave_requested"
 * when anyone in the shift waits for a leave decision.
 *
 * @param shift - shift from W-3
 * @param user - viewer, or `null`
 * @returns the shift with `view` and `durationHours`
 */
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

/**
 * Tells whether an assignment takes a seat in the shift (BR-43).
 *
 * @param status - assignment status
 * @returns `true` for statuses counted against `maxStaff`
 */
export const isSeatHolder = (status: Shift["assignments"][number]["status"]) =>
  OCCUPYING_STATUSES.includes(status);

/**
 * Schedule data, navigation and actions. Every action rejects with the
 * `ApiError` when the server refuses it; the schedule is reloaded either way.
 */
interface ShiftContextType {
  /** Open shifts in the visible range, as seen by the current user. */
  shifts: ShiftView[];
  departments: Department[];
  /** `true` until the first load finished. */
  isLoading: boolean;
  /** Error text of the last load, `null` when it succeeded. */
  loadError: string | null;
  view: ScheduleView;
  /**
   * Switches between week and month layout.
   *
   * @param view - layout to show
   */
  setView: (view: ScheduleView) => void;

  /** Day the schedule is centred on. */
  currentDate: Date;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  /** Jumps back to `SCHEDULE_TODAY`. */
  goToToday: () => void;

  /**
   * Registers the current user for a shift (W-7, BR-43 → BR-46).
   *
   * @param shiftId - shift to join
   */
  register: (shiftId: number) => Promise<void>;
  /**
   * Cancels the current user's registration (W-8). Allowed until P-10 hours
   * before the start (BR-47).
   *
   * @param shiftId - shift to leave
   */
  unregister: (shiftId: number) => Promise<void>;
  /**
   * Asks for leave on a registered shift (W-9, BR-48).
   *
   * @param assignmentId - the user's assignment
   * @param reason - reason shown to the manager, required
   */
  requestLeave: (assignmentId: number, reason: string) => Promise<void>;
  /**
   * Approves or rejects a leave request (W-10). Managers only.
   *
   * @param assignmentId - assignment with status `LEAVE_REQUESTED`
   * @param approve - `true` to approve, `false` to reject
   */
  decideLeave: (assignmentId: number, approve: boolean) => Promise<void>;
  /**
   * Records attendance after the shift started (W-11, BR-49). Managers only.
   *
   * @param assignmentId - assignment to mark
   * @param status - `ATTENDED` or `ABSENT`
   */
  markAttendance: (
    assignmentId: number,
    status: "ATTENDED" | "ABSENT",
  ) => Promise<void>;
  /**
   * Removes a staff member from a shift that has not started (W-12, BR-42).
   * Managers only; the staff member is notified.
   *
   * @param assignmentId - assignment to remove
   */
  removeAssignment: (assignmentId: number) => Promise<void>;
  /**
   * Creates a shift (W-4, BR-40, BR-41). Managers only.
   *
   * @param input - department, date, times, wage and seats
   */
  createShift: (input: ShiftInput) => Promise<void>;
  /**
   * Updates a shift (W-5). Managers only.
   *
   * @param id - shift id
   * @param input - new values
   * @param version - version the form was opened with (BR-27)
   */
  updateShift: (
    id: number,
    input: ShiftInput,
    version: number,
  ) => Promise<void>;
  /**
   * Cancels a shift and notifies everyone in it (W-6, BR-42). Managers only.
   *
   * @param id - shift id
   * @param reason - reason sent to the staff
   * @param version - version the form was opened with (BR-27)
   */
  cancelShift: (id: number, reason: string, version: number) => Promise<void>;

  /**
   * Finds a loaded shift.
   *
   * @param id - shift id
   * @returns the shift, or `undefined` when it is not in the visible range
   */
  getShift: (id: number) => ShiftView | undefined;
  /**
   * Lists the shifts of one day.
   *
   * @param date - `"YYYY-MM-DD"`
   */
  getShiftsForDate: (date: string) => ShiftView[];
  /** The 7 days (Mon → Sun) of the week of `currentDate`. */
  getWeekDates: () => Date[];
  /** Labour cost of the visible week (BR-52), managers only */
  weeklyLaborCost: number | null;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

/**
 * Computes the date range to load: the whole month of `date` plus the weeks
 * that overlap it, so both layouts can be drawn from one request.
 *
 * @param date - day the schedule is centred on
 * @returns `from` and `to` as `"YYYY-MM-DD"`, both included
 */
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

/**
 * Loads the shift schedule around `currentDate` and exposes navigation and
 * shift actions. Mounted by the schedule page.
 *
 * @param props.user - logged-in staff member or manager
 * @param props.children - schedule components
 */
export function ShiftProvider({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
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
        shiftService.listShifts({ from, to }),
        shiftService.listDepartments(),
      ]);
      setRawShifts(shifts);
      setDepartments(deps);
      setLoadError(null);
      if (isManager) {
        const report = await analyticsService.getLaborCost(
          new Date(`${weekStartIso}T00:00:00`),
        );
        setWeeklyLaborCost(report.total);
      }
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [from, to, isManager, weekStartIso]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- state is set only after the service call resolves
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
    createShift: run((input: ShiftInput) => shiftService.createShift(input)),
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

/**
 * Reads the schedule and its actions.
 *
 * @returns the schedule context (see `ShiftContextType`)
 * @throws {Error} when used outside `ShiftProvider`
 */
export function useShift() {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error("useShift must be used within a ShiftProvider");
  }
  return context;
}
