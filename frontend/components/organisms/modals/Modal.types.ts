import type { Review } from "@/lib/types";

export interface ReviewModalProps {
  orderId: number;
  orderCode: string;
  onClose: () => void;
  onSubmitted: (review: Review) => void;
}
