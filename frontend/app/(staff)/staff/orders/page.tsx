"use client";

import { Alert } from "@/components/atoms";
import { Modal } from "@/components/molecules/modal";
import Header from "@/layouts/header";
import { useAuth } from "@/lib/contexts/auth-context";
import { ApiError, orderService } from "@/lib/services";
import type { Order, OrderStatus, PaymentMethod } from "@/lib/types";
import { formatVND } from "@/lib/utils/currency";
import { errorMessage } from "@/lib/utils/errors";
import { ORDER_STATUS, formatDateTime } from "@/lib/utils/order";
import { useCallback, useEffect, useState } from "react";

/** How often the queue is reloaded. */
const POLL_MS = 5000;
/** Statuses that still need work from the staff. */
const QUEUE: OrderStatus[] = ["PENDING_PAYMENT", "PAID", "PREPARING", "READY"];

type Action =
  | { kind: "confirm"; method: PaymentMethod }
  | { kind: "start" }
  | { kind: "ready" }
  | { kind: "complete" };

/**
 * Staff order queue (UC-10): confirm payment, start, mark ready and complete
 * orders (O-4 → O-8), or cancel them (UC-11, O-9). Reloads every few seconds;
 * a toggle shows finished orders instead.
 */
export default function StaffOrdersPage() {
  const { user } = useAuth();
  const isManager = user!.role === "MANAGER";

  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [message, setMessage] = useState<{
    tone: "error" | "info";
    text: string;
  } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState<Order | null>(null);

  const load = useCallback(async () => {
    try {
      setOrders(
        await orderService.listQueue({
          status: showDone ? ["COMPLETED", "CANCELLED"] : QUEUE,
          q: query,
        }),
      );
    } catch (err) {
      setMessage({ tone: "error", text: errorMessage(err) });
    }
  }, [showDone, query]);

  useEffect(() => {
    const first = setTimeout(load, query ? 250 : 0);
    const poll = setInterval(load, POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(poll);
    };
  }, [load, query]);

  const run = async (order: Order, action: Action) => {
    setBusyId(order.id);
    setMessage(null);
    try {
      if (action.kind === "confirm")
        await orderService.confirmPayment(order.id, {
          method: action.method,
          amount: order.total,
          version: order.version,
        });
      if (action.kind === "start")
        await orderService.start(order.id, order.version);
      if (action.kind === "ready")
        await orderService.markReady(order.id, order.version);
      if (action.kind === "complete")
        await orderService.complete(order.id, order.version);
    } catch (err) {
      // BR-26/BR-27: someone else acted first; the reload below shows the current state
      const conflict = err instanceof ApiError && err.status === 409;
      setMessage(
        conflict
          ? {
              tone: "info",
              text: "Đơn vừa được người khác xử lý. Đã tải lại danh sách.",
            }
          : { tone: "error", text: errorMessage(err) },
      );
    } finally {
      setBusyId(null);
      await load();
    }
  };

  const columns = showDone
    ? (["COMPLETED", "CANCELLED"] as OrderStatus[])
    : QUEUE;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-6 md:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-foreground text-2xl font-bold">Đơn hàng</h1>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm mã đơn, VD 0042"
              aria-label="Tìm theo mã đơn"
              className="w-48 rounded-xl border border-(--color-border) px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowDone((v) => !v)}
              className="cursor-pointer rounded-xl border border-(--color-border) bg-transparent px-3 py-2 text-sm font-semibold"
            >
              {showDone ? "Đơn đang xử lý" : "Đơn đã xong / huỷ"}
            </button>
          </div>
        </div>

        <Alert message={message?.text} tone={message?.tone} className="mb-4" />

        <div
          className={`grid gap-4 ${showDone ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-4"}`}
        >
          {columns.map((status) => {
            const list = orders.filter((o) => o.status === status);
            return (
              <section
                key={status}
                className="rounded-2xl bg-(--color-border-light)/40 p-3"
              >
                <h2 className="mb-3 flex items-center justify-between text-sm font-bold">
                  <span>{ORDER_STATUS[status].label}</span>
                  <span className="rounded-full bg-white px-2 text-xs">
                    {list.length}
                  </span>
                </h2>
                <ul className="space-y-3">
                  {list.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      busy={busyId === o.id}
                      isManager={isManager}
                      onAction={(a) => run(o, a)}
                      onCancel={() => setCancelling(o)}
                    />
                  ))}
                  {list.length === 0 && (
                    <li className="text-xs text-(--color-text-muted)">
                      Không có đơn
                    </li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      </main>

      {cancelling && (
        <CancelDialog
          order={cancelling}
          onClose={() => setCancelling(null)}
          onDone={async (text) => {
            setCancelling(null);
            setMessage(text ? { tone: "error", text } : null);
            await load();
          }}
        />
      )}
    </>
  );
}

/**
 * One order in the queue with the buttons for its next step.
 * @param props.order The order.
 * @param props.busy Disables the buttons while an action runs.
 * @param props.isManager Managers may also cancel paid orders.
 * @param props.onAction Called with the chosen step.
 * @param props.onCancel Opens the cancel dialog.
 */
function OrderCard({
  order,
  busy,
  isManager,
  onAction,
  onCancel,
}: {
  order: Order;
  busy: boolean;
  isManager: boolean;
  onAction: (a: Action) => void;
  onCancel: () => void;
}) {
  const btn =
    "flex-1 cursor-pointer rounded-lg border-none px-3 py-2 text-xs font-semibold text-white disabled:opacity-50";
  // O-9 matrix: staff cancel unpaid orders, only managers cancel paid ones (BR-29)
  const canCancel =
    order.status === "PENDING_PAYMENT" ||
    (isManager && (order.status === "PAID" || order.status === "PREPARING"));

  return (
    <li className="bg-card rounded-xl border border-(--color-border-light) p-3 text-sm shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-bold">{order.code.slice(-4)}</span>
        <span className="text-xs text-(--color-text-muted)">
          {formatDateTime(order.createdAt).slice(0, 5)}
        </span>
      </div>
      <p className="mb-1 text-xs text-(--color-text-muted)">
        {order.code}
        {order.tableLabel && ` · Bàn ${order.tableLabel}`}
        {order.customerPhone && ` · ${order.customerPhone}`}
      </p>
      <ul className="mb-2">
        {order.items.map((i) => (
          <li key={`${i.type}-${i.id}`}>
            {i.quantity} × {i.name}
          </li>
        ))}
      </ul>
      {order.note && (
        <p className="mb-2 rounded bg-amber-50 px-2 py-1 text-xs">
          Ghi chú: {order.note}
        </p>
      )}
      <p className="mb-2 font-semibold text-(--color-primary)">
        {formatVND(order.total)} ·{" "}
        {order.payment.method === "QR" ? "QR" : "Tiền mặt"}
      </p>
      {order.status === "CANCELLED" && (
        <p className="text-xs text-red-600">{order.cancelReason}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {order.status === "PENDING_PAYMENT" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onAction({ kind: "confirm", method: "CASH" })}
              className={`${btn} bg-emerald-600`}
            >
              Đã thu tiền mặt
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onAction({ kind: "confirm", method: "QR" })}
              className={`${btn} bg-sky-600`}
            >
              Đã nhận CK
            </button>
          </>
        )}
        {order.status === "PAID" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAction({ kind: "start" })}
            className={`${btn} bg-violet-600`}
          >
            Bắt đầu pha
          </button>
        )}
        {order.status === "PREPARING" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAction({ kind: "ready" })}
            className={`${btn} bg-emerald-600`}
          >
            Đã xong
          </button>
        )}
        {order.status === "READY" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAction({ kind: "complete" })}
            className={`${btn} bg-(--color-primary)`}
          >
            Khách đã nhận
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-red-200 bg-transparent px-3 py-2 text-xs font-semibold text-red-600"
          >
            Huỷ
          </button>
        )}
      </div>
    </li>
  );
}

/**
 * Cancel dialog. A paid order needs a reason and is refunded (BR-29).
 * @param props.order The order to cancel.
 * @param props.onClose Closes the dialog.
 * @param props.onDone Called after the attempt with the error text, or null.
 */
function CancelDialog({
  order,
  onClose,
  onDone,
}: {
  order: Order;
  onClose: () => void;
  onDone: (error: string | null) => void;
}) {
  const paid = order.status !== "PENDING_PAYMENT";
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    try {
      await orderService.cancel(order.id, { version: order.version, reason });
      onDone(null);
    } catch (err) {
      onDone(errorMessage(err));
    }
  };

  return (
    <Modal
      onClose={onClose}
      labelledBy="cancel-order-title"
      className="max-w-sm p-6"
    >
      <h2 id="cancel-order-title" className="mb-2 text-lg font-bold">
        Huỷ đơn {order.code}?
      </h2>
      <p className="mb-3 text-sm text-(--color-text-muted)">
        {paid
          ? "Đơn đã thanh toán, quán phải hoàn tiền cho khách. Bắt buộc nhập lý do."
          : "Đơn chưa thanh toán sẽ bị huỷ ngay."}
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Lý do huỷ"
        maxLength={200}
        className="mb-4 w-full rounded-lg border border-(--color-border) p-2 text-sm"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-lg border border-(--color-border) bg-transparent px-4 py-2 text-sm"
        >
          Đóng
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={sending || (paid && !reason.trim())}
          className="cursor-pointer rounded-lg border-none bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Huỷ đơn
        </button>
      </div>
    </Modal>
  );
}
