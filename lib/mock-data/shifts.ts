// Mock data — replace with backend calls in lib/services when ready.
import type { ShiftSlot } from "../types";

/**
 * Generate mock shift slots for the weeks around today (April 2026).
 * Covers Mon 6 Apr – Sun 26 Apr 2026.
 */
function generateMockShifts(): ShiftSlot[] {
  const shifts: ShiftSlot[] = [];
  const departments = ["bar", "kitchen", "cashier", "janitor"];
  const timeSlots = [
    { start: "07:00", end: "11:00", hours: 4, wage: 120000 },
    { start: "11:00", end: "15:00", hours: 4, wage: 120000 },
    { start: "15:00", end: "19:00", hours: 4, wage: 120000 },
    { start: "19:00", end: "22:00", hours: 3, wage: 100000 },
  ];

  const staffPool = [
    { id: 2, name: "Nguyễn Văn An" },
    { id: 3, name: "Trần Thị Bình" },
    { id: 4, name: "Lê Văn Cường" },
  ];

  // Generate shifts from April 6 to April 26, 2026
  let shiftCounter = 0;
  for (let day = 6; day <= 26; day++) {
    const dateStr = `2026-04-${day.toString().padStart(2, "0")}`;

    for (const dept of departments) {
      // Not every department has shifts every day
      if (dept === "janitor" && day % 3 !== 0) continue;

      for (const slot of timeSlots) {
        // Skip some slots randomly for variety
        if (dept === "kitchen" && slot.start === "19:00") continue;
        if (dept === "cashier" && slot.start === "07:00" && day % 2 === 0)
          continue;

        shiftCounter++;
        const shiftId = `shift_${shiftCounter.toString().padStart(3, "0")}`;

        // Determine registration status
        const registered: { id: number; name: string }[] = [];
        let status: ShiftSlot["status"] = "available";

        // Past shifts (before April 10) are mostly registered
        if (day < 10) {
          const staffIdx = shiftCounter % staffPool.length;
          registered.push(staffPool[staffIdx]);
          if (shiftCounter % 7 === 0) {
            registered.push(staffPool[(staffIdx + 1) % staffPool.length]);
          }
          status = "registered";
          // Some past shifts have leave/absent
          if (shiftCounter % 11 === 0) status = "approved_leave";
          if (shiftCounter % 13 === 0) status = "absent";
        }
        // Current week (April 6-12): mix of registered and available
        else if (day >= 10 && day <= 12) {
          if (shiftCounter % 3 === 0) {
            registered.push(staffPool[shiftCounter % staffPool.length]);
            status = "registered";
          }
        }
        // Future shifts: mostly available, some registered
        else {
          if (shiftCounter % 5 === 0) {
            registered.push(staffPool[shiftCounter % staffPool.length]);
            status = "registered";
          }
        }

        shifts.push({
          id: shiftId,
          date: dateStr,
          startTime: slot.start,
          endTime: slot.end,
          durationHours: slot.hours,
          wage: slot.wage,
          department: dept,
          maxStaff: dept === "bar" ? 3 : 2,
          registeredStaff: registered,
          status,
        });
      }
    }
  }

  return shifts;
}

export const MOCK_SHIFT_SLOTS: ShiftSlot[] = generateMockShifts();
