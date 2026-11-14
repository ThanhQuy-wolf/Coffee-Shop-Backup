import type { AssignmentStatus } from "../types";

export interface ShiftRow {
  id: number;
  shopId: number;
  departmentId: number;
  date: string;
  startTime: string;
  endTime: string;
  wage: number;
  maxStaff: number;
  allowCrossDepartment: boolean;
  status: "OPEN" | "CANCELLED";
  version: number;
}

export interface AssignmentRow {
  id: number;
  shiftId: number;
  staffId: number;
  status: AssignmentStatus;
  leaveReason: string | null;
}

const TIME_SLOTS = [
  { start: "07:00", end: "11:00", wage: 120000 },
  { start: "11:00", end: "15:00", wage: 120000 },
  { start: "15:00", end: "19:00", wage: 120000 },
  { start: "19:00", end: "22:00", wage: 100000 },
];

/** staff id → department id, see users.ts */
const STAFF = [
  { id: 2, departmentId: 1 },
  { id: 3, departmentId: 3 },
  { id: 4, departmentId: 2 },
];

/**
 * Shifts of shop 1 from Mon 6/4 to Sun 26/4/2026, around the mock "today"
 * (10/04/2026). Each staff member is only placed in their own department, so
 * the seed never breaks BR-45 or BR-46.
 */
function generate() {
  const shifts: ShiftRow[] = [];
  const assignments: AssignmentRow[] = [];
  let shiftId = 0;
  let assignmentId = 0;

  for (let day = 6; day <= 26; day++) {
    const date = `2026-04-${day.toString().padStart(2, "0")}`;
    for (const departmentId of [1, 2, 3, 4]) {
      if (departmentId === 4 && day % 3 !== 0) continue;
      TIME_SLOTS.forEach((slot, slotIndex) => {
        if (departmentId === 2 && slot.start === "19:00") return;
        if (departmentId === 3 && slot.start === "07:00" && day % 2 === 0)
          return;

        shiftId++;
        shifts.push({
          id: shiftId,
          shopId: 1,
          departmentId,
          date,
          startTime: slot.start,
          endTime: slot.end,
          wage: slot.wage,
          maxStaff: departmentId === 1 ? 3 : 2,
          allowCrossDepartment: departmentId === 4,
          status: "OPEN",
          version: 1,
        });

        const staff = STAFF.find((s) => s.departmentId === departmentId);
        // One shift per staff per day keeps the seed free of overlaps.
        if (!staff || slotIndex !== day % TIME_SLOTS.length) return;

        let status: AssignmentStatus = "REGISTERED";
        let leaveReason: string | null = null;
        if (day < 10) status = day % 4 === 0 ? "ABSENT" : "ATTENDED";
        else if (day === 13 && staff.id === 2) {
          status = "LEAVE_REQUESTED";
          leaveReason = "Thi cuối kỳ";
        } else if (day > 16 && day % 2 === 1) return;

        assignmentId++;
        assignments.push({
          id: assignmentId,
          shiftId,
          staffId: staff.id,
          status,
          leaveReason,
        });
      });
    }
  }
  return { shifts, assignments };
}

export const MOCK_SHIFT_SEED = generate();
