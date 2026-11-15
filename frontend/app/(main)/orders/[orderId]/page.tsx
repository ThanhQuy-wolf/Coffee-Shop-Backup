"use client";

import { Alert, Icon, Spinner } from "@/components/atoms";
import { ReviewModal } from "@/components/organisms/modals";
import { useAuth } from "@/lib/contexts/auth-context";
import { useCart } from "@/lib/contexts/cart-context";
import { useGuestOrders } from "@/lib/hooks/use-guest-orders";
import { orderService } from "@/lib/services";
import type { Order } from "@/lib/types";
import { formatVND } from "@/lib/utils/currency";
import { errorCode, errorMessage } from "@/lib/utils/errors";
import { optionLines } from "@/lib/utils/options";
import { ORDER_STATUS, formatDateTime, secondsUntil } from "@/lib/utils/order";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/** How often the order is reloaded while it is still in progress. */
const POLL_MS = 5000;
const FINAL = new Set(["COMPLETED", "CANCELLED"]);

/** Progress steps shown for an order that was not cancelled. */
const STEPS = [
  "PENDING_PAYMENT",
  "PAID",
  "PREPARING",
  "READY",
  "COMPLETED",
] as const;

/**
 * Order tracking page (UC-08): status steps, payment countdown and QR, items
 * and total. Reloads every few seconds until the order is final. The customer
 * can cancel while it is unpaid (UC-11) and review it once completed (UC-16).
 */
export default function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const id = Number(orderId);
  const router = useRouter();
  const { user, isReady } = useAuth();
  const { loadCart } = useCart();
  const guestOrders = useGuestOrders();
  const guestToken = guestOrders.tokenFor(id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [now, setNow] = useState(() => orderService.now());
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const o = await orderService.get(id, guestToken);
      setOrder(o);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        errorCode(err) === "NOT_FOUND"
          ? "Không tìm thấy đơn, hoặc đơn được đặt trên thiết bị khác."
          : errorMessage(err),
      );
    }
  }, [id, guestToken]);

  const isFinal = !!order && FINAL.has(order.status);

  useEffect(() => {
    // The guest token is read from localStorage, which the first render cannot see yet
    if (!isReady) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- state is set only after the service call resolves
    load();
    if (isFinal) return;
    const poll = setInterval(load, POLL_MS);
    const tick = setInterval(() => setNow(orderService.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [load, isFinal, isReady]);

  if (loadError && !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Icon name="receipt" className="mb-4 text-5xl text-(--color-border)" />
        <p className="text-foreground mb-4 font-semibold">{loadError}</p>
        <Link href="/" className="text-(--color-primary) hover:underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  if (!order) {
    return <Spinner className="py-24" />;
  }

  const status = ORDER_STATUS[order.status];
  const pending = order.status === "PENDING_PAYMENT";
  const left = secondsUntil(order.paymentDeadline, now);
  const expired =
    order.status === "CANCELLED" && order.cancelReason === "PAYMENT_TIMEOUT";
  const canReview =
    user?.role === "CUSTOMER" &&
    user.id === order.customerId &&
    order.status === "COMPLETED" &&
    !order.review;

  const cancel = async () => {
    setBusy(true);
    setActionError(null);
    try {
      setOrder(
        await orderService.cancel(
          order.id,
          { version: order.version },
          guestToken,
        ),
      );
    } catch (err) {
      // BR-27: the shop confirmed payment meanwhile, so show the new state
      setActionError(errorMessage(err));
      await load();
    } finally {
      setBusy(false);
    }
  };

  const reorder = () => {
    loadCart(
      order.items.map(({ type, id, name, unitPrice, quantity, options }) => ({
        type,
        id,
        name,
        unitPrice,
        quantity,
        options,
      })),
    );
    router.push("/checkout");
  };

  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6 md:py-8">
      <div className="bg-card rounded-2xl border border-(--color-border-light) p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-wide">
              {order.code}
            </h1>
            <p className="text-xs text-(--color-text-muted)">
              Đặt lúc {formatDateTime(order.createdAt)}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}
          >
            <Icon name={status.icon} />
            {status.label}
          </span>
        </div>

        {stepIndex >= 0 && (
          <ol
            className="mt-5 grid grid-cols-5 gap-1"
            aria-label="Tiến trình đơn"
          >
            {STEPS.map((s, i) => (
              <li key={s} className="text-center">
                <div
                  className={`mb-1 h-1.5 rounded-full ${i <= stepIndex ? "bg-(--color-primary)" : "bg-(--color-border-light)"}`}
                />
                <span
                  className={`text-[11px] ${i === stepIndex ? "font-semibold text-(--color-primary)" : "text-(--color-text-muted)"}`}
                >
                  {ORDER_STATUS[s].label}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {pending && (
        <div className="bg-card space-y-3 rounded-2xl border border-(--color-warning)/30 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">
              {order.payment.method === "QR"
                ? "Chuyển khoản theo thông tin dưới đây"
                : "Thanh toán tại quầy"}
            </h2>
            <span
              className="font-mono text-lg font-bold text-(--color-warning)"
              aria-label="Thời gian còn lại"
            >
              {Math.floor(left / 60)}:{(left % 60).toString().padStart(2, "0")}
            </span>
          </div>
          {order.payment.method === "QR" ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-(--color-text-muted)">Số tiền</dt>
              <dd className="font-bold text-(--color-primary)">
                {formatVND(order.payment.amount)}
              </dd>
              <dt className="text-(--color-text-muted)">Nội dung</dt>
              <dd className="font-mono font-bold">
                {order.payment.transferContent}
              </dd>
            </dl>
          ) : (
            <p className="text-sm">
              Đọc mã <b>{order.code}</b> cho thu ngân và thanh toán{" "}
              <b>{formatVND(order.total)}</b>.
            </p>
          )}
          <p className="text-xs text-(--color-text-muted)">
            Trang tự cập nhật khi quán xác nhận. Hết giờ mà chưa thanh toán thì
            đơn tự huỷ.
          </p>
          <button
            type="button"
            onClick={cancel}
            disabled={busy}
            className="cursor-pointer rounded-xl border border-(--color-danger)/30 bg-transparent px-4 py-2 text-sm font-semibold text-(--color-danger) hover:bg-(--color-danger-bg) disabled:opacity-50"
          >
            Huỷ đơn
          </button>
        </div>
      )}

      {order.status === "CANCELLED" && (
        <div className="rounded-2xl border border-(--color-danger)/30 bg-(--color-danger-bg) p-5 text-sm text-(--color-danger)">
          <p className="font-semibold">
            {expired
              ? "Đơn đã tự huỷ vì quá thời gian thanh toán."
              : `Đơn đã huỷ: ${order.cancelReason ?? ""}`}
          </p>
          {order.payment.status === "REFUNDED" && (
            <p className="mt-1">Quán sẽ hoàn tiền cho bạn.</p>
          )}
          {expired && (
            <button
              type="button"
              onClick={reorder}
              className="mt-3 cursor-pointer rounded-xl border-none bg-(--color-primary) px-4 py-2 font-semibold text-white"
            >
              Đặt lại các món này
            </button>
          )}
        </div>
      )}

      {order.status === "READY" && (
        <div className="rounded-2xl border border-(--color-success)/30 bg-(--color-success-bg) p-5 text-sm font-semibold text-(--color-success)">
          Đồ uống đã sẵn sàng, mời bạn nhận tại quầy.
        </div>
      )}

      <Alert message={actionError} />

      <div className="bg-card rounded-2xl border border-(--color-border-light)">
        <ul className="divide-y divide-(--color-border-light)">
          {order.items.map((item, i) => (
            <li
              key={i}
              className="flex justify-between gap-3 px-5 py-3 text-sm"
            >
              <span>
                {item.quantity} × {item.name}
                {optionLines(item.options).map((text) => (
                  <span
                    key={text}
                    className="block text-xs text-(--color-text-muted)"
                  >
                    {text}
                  </span>
                ))}
              </span>
              <span className="font-medium">{formatVND(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-(--color-border-light) px-5 py-3">
          <span className="text-(--color-text-muted)">
            Tổng cộng{order.tableLabel ? ` · Bàn ${order.tableLabel}` : ""}
          </span>
          <span className="font-bold text-(--color-primary)">
            {formatVND(order.total)}
          </span>
        </div>
        {order.note && (
          <p className="px-5 pb-3 text-sm text-(--color-text-muted)">
            Ghi chú: {order.note}
          </p>
        )}
      </div>

      {order.review && (
        <div className="bg-card rounded-2xl border border-(--color-border-light) p-5 text-sm">
          <p className="mb-1 font-semibold">Đánh giá của bạn</p>
          <p className="text-yellow-500">
            {"★".repeat(order.review.rating)}
            {"☆".repeat(5 - order.review.rating)}
          </p>
          {order.review.comment && (
            <p className="mt-1">{order.review.comment}</p>
          )}
        </div>
      )}
      {canReview && (
        <button
          type="button"
          onClick={() => setReviewing(true)}
          className="w-full cursor-pointer rounded-xl border-none bg-(--color-primary) py-3 font-semibold text-white hover:bg-(--color-primary-dark)"
        >
          Đánh giá đơn này
        </button>
      )}

      {reviewing && (
        <ReviewModal
          orderId={order.id}
          orderCode={order.code}
          onClose={() => setReviewing(false)}
          onSubmitted={(review) => setOrder({ ...order, review })}
        />
      )}
    </div>
  );
}
