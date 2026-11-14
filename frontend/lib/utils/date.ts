// ─── Date helpers (shared by shift schedule pages/components) ────────────────

/**
 * "Today" used by the shift schedule while it runs on mock data.
 * The mock shifts are generated around this date, so keep them in sync.
 * Switch to `new Date()` once shifts come from the backend.
 */
export const SCHEDULE_TODAY = new Date(2026, 3, 10); // 10/04/2026

const pad2 = (n: number) => n.toString().padStart(2, "0");

/** Monday 00:00 of the week containing `d` (weeks start on Monday). */
export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

/** The 7 dates (Mon → Sun) of the week containing `d`. */
export function getWeekDates(d: Date): Date[] {
  const monday = getMonday(d);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

/** "YYYY-MM-DD" in local time. */
export function formatDateISO(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** "DD/MM" */
export function formatDateShort(d: Date): string {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

export function isToday(d: Date): boolean {
  return isSameDay(d, SCHEDULE_TODAY);
}

/** "HH:mm" → minutes since midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export const MONTH_NAMES_VI = Array.from(
  { length: 12 },
  (_, i) => `Tháng ${i + 1}`,
);
