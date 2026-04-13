import type { ShiftSlot } from "@/lib/types";

export interface ShiftCardProps {
  shift: ShiftSlot;
  compact?: boolean;
  onClick?: (shift: ShiftSlot) => void;
}
