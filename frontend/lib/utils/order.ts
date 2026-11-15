import type { OrderStatus } from "../types";

/** Label, badge colours and icon name for each order status. */
export const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; className: string; icon: string }
> = {
  PENDING_PAYMENT: {
    label: "Chờ thanh toán",
    className: "bg-(--color-warning-bg) text-(--color-warning)",
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
    className: "bg-(--color-success-bg) text-(--color-success)",
    icon: "fa-bell-concierge",
  },
  COMPLETED: {
    label: "Hoàn tất",
    className: "bg-gray-100 text-gray-700",
    icon: "fa-flag-checkered",
  },
  CANCELLED: {
    label: "Đã huỷ",
    className: "bg-(--color-danger-bg) text-(--color-danger)",
    icon: "fa-ban",
  },
};

/**
 * Formats a timestamp from the API for display.
 *
 * @param isoString - ISO-8601 time, e.g. `"2026-04-10T09:15:00+07:00"`
 * @returns local time as `"HH:mm DD/MM/YYYY"` (vi-VN order)
 */
export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Counts down to a deadline, e.g. the payment deadline of an order (BR-28).
 *
 * @param deadline - ISO-8601 time
 * @param now - current time; pass the server clock (`orderService.now()`)
 * @returns whole seconds left, `0` once the deadline has passed
 */
export function secondsUntil(deadline: string, now: Date): number {
  return Math.max(
    0,
    Math.floor((new Date(deadline).getTime() - now.getTime()) / 1000),
  );
}
