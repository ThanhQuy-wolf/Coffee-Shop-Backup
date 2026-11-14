import type { OrderStatus } from "../types";

export const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; className: string; icon: string }
> = {
  PENDING_PAYMENT: {
    label: "Chờ thanh toán",
    className: "bg-amber-100 text-amber-800",
    icon: "fa-hourglass-half",
  },
  PAID: {
    label: "Đã thanh toán",
    className: "bg-sky-100 text-sky-800",
    icon: "fa-circle-check",
  },
  PREPARING: {
    label: "Đang pha chế",
    className: "bg-violet-100 text-violet-800",
    icon: "fa-mug-hot",
  },
  READY: {
    label: "Sẵn sàng",
    className: "bg-emerald-100 text-emerald-800",
    icon: "fa-bell-concierge",
  },
  COMPLETED: {
    label: "Hoàn tất",
    className: "bg-gray-100 text-gray-700",
    icon: "fa-flag-checkered",
  },
  CANCELLED: {
    label: "Đã huỷ",
    className: "bg-red-100 text-red-700",
    icon: "fa-ban",
  },
};

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Whole seconds left until `deadline`, never negative. */
export function secondsUntil(deadline: string, now: Date): number {
  return Math.max(
    0,
    Math.floor((new Date(deadline).getTime() - now.getTime()) / 1000),
  );
}
