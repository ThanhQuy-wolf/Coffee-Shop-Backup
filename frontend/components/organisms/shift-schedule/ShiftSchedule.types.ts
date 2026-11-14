import type { ShiftView } from "@/lib/contexts/shift-context";

export interface WeeklyScheduleProps {
  onShiftClick: (shift: ShiftView) => void;
  onCreateShift?: (date: string) => void;
  mobileCalendarHeader?: boolean;
}

export interface MonthlyCalendarProps {
  onDateSelect?: (date: string) => void;
}

export interface MobileShiftViewProps {
  onShiftClick: (shift: ShiftView) => void;
}

export interface ShiftDetailModalProps {
  /** Looked up in the context so the modal shows fresh data after each action */
  shiftId: number | null;
  onClose: () => void;
  onEdit: (shift: ShiftView) => void;
}

export interface ShiftFormModalProps {
  onClose: () => void;
  defaultDate?: string;
  /** Edit mode when given */
  shift?: ShiftView;
}
