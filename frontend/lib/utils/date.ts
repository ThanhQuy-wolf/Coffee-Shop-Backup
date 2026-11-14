/**
 * "Today" used by the shift schedule while it runs on mock data.
 * The mock shifts are generated around this date, so keep them in sync.
 * Switch to `new Date()` once shifts come from the backend.
 */
export const SCHEDULE_TODAY = new Date(2026, 3, 10); // 10/04/2026

/**
 * Pads a number to two digits.
 * @param n Day, month, hour or minute.
 */
const pad2 = (n: number) => n.toString().padStart(2, "0");

/**
 * Finds the start of the week. Weeks start on Monday.
 *
 * @param d - any day of the week
 * @returns a new Date at Monday 00:00 of that week
 */
export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Lists the days of a week.
 *
 * @param d - any day of the week
 * @returns 7 new Dates, Monday to Sunday
 */
export function getWeekDates(d: Date): Date[] {
  const monday = getMonday(d);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

/**
 * Formats a date as the API expects it (NFR-06).
 *
 * @param d - date, read in local time
 * @returns `"YYYY-MM-DD"`
 */
export function formatDateISO(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Formats a date for compact labels.
 *
 * @param d - date, read in local time
 * @returns `"DD/MM"`
 */
export function formatDateShort(d: Date): string {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

/**
 * Compares two dates by calendar day, ignoring the time.
 *
 * @param a - first date
 * @param b - second date
 * @returns `true` when both fall on the same local day
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

/**
 * Tells whether a date is "today" for the shift schedule (`SCHEDULE_TODAY`).
 *
 * @param d - date to check
 * @returns `true` when `d` is the schedule's today
 */
export function isToday(d: Date): boolean {
  return isSameDay(d, SCHEDULE_TODAY);
}

/**
 * Converts a time of day to a number, to compare or subtract shift times.
 *
 * @param time - `"HH:mm"`
 * @returns minutes since midnight, e.g. `"07:30"` → `450`
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Short weekday labels from Monday: `"T2"` … `"T7"`, `"CN"`. */
export const WEEKDAY_LABELS_VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** `"Tháng 1"` … `"Tháng 12"`, index 0 = January. */
export const MONTH_NAMES_VI = Array.from(
  { length: 12 },
  (_, i) => `Tháng ${i + 1}`,
);
