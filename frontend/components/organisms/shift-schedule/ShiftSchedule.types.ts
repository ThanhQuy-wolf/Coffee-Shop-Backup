import type { ShiftSlot } from "@/lib/types";

export interface WeeklyScheduleProps {
  onShiftClick: (shift: ShiftSlot) => void;
  onCreateShift?: (date: string) => void;
  mobileCalendarHeader?: boolean;
}

export interface MonthlyCalendarProps {
  onShiftClick: (shift: ShiftSlot) => void;
  onDateSelect?: (date: string) => void;
}

export interface MobileShiftViewProps {
  onShiftClick: (shift: ShiftSlot) => void;
}

export interface ShiftDetailModalProps {
  shift: ShiftSlot | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface ShiftCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}
