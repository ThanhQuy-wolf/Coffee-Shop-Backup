// ─── Shifts service ──────────────────────────────────────────────────────────
// Mock data for now — swap for an API call when the backend is ready.
import { MOCK_SHIFT_SLOTS } from "../mock-data/shifts";
import type { ShiftSlot } from "../types";

export function getShiftSlots(): ShiftSlot[] {
  return MOCK_SHIFT_SLOTS;
}
