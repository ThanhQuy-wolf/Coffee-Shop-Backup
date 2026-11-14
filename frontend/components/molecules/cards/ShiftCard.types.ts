import type { ShiftView } from "@/lib/contexts/shift-context";

export interface ShiftCardProps {
  shift: ShiftView;
  compact?: boolean;
  onClick?: (shift: ShiftView) => void;
}
