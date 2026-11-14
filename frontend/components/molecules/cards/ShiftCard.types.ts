import type { ShiftView } from "@/lib/contexts/shift-context";

export interface ShiftCardProps {
  shift: ShiftView;
  /** Small layout without the staff list. */
  compact?: boolean;
  onClick?: (shift: ShiftView) => void;
}
