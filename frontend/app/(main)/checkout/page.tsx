"use client";

import { Alert } from "@/components/atoms";
import { type CartLine, useCart } from "@/lib/contexts/cart-context";
import { useGuestOrders } from "@/lib/hooks/use-guest-orders";
import { ApiError, orderService } from "@/lib/services";
import type { PaymentMethod } from "@/lib/types";
import { formatVND } from "@/lib/utils/currency";
import { errorCode, errorMessage } from "@/lib/utils/errors";
import { optionLines } from "@/lib/utils/options";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MAX_QTY = 20; // P-08 default; the server checks the configured value

/** `line` is the index in the request, which follows cart.lines */
type ItemError = {
  line: number;
  reason?: string;
  optionValueId?: number;
  /** Unit of a combo the error is about (FR-37) */
  componentNo?: number;
  message?: string;
  currentPrice?: number;
};

/**
 * Checkout page (UC-07): review and edit the cart, choose cash or QR, add a
 * table and note, then place the order (O-1). Items that stopped selling or
 * changed price are flagged on their lines.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    totalPrice,
    setQuantity,
    removeLine,
    applyPrices,
    clearCart,
    toOrderItems,
  } = useCart();
  const guestOrders = useGuestOrders();

  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [tableLabel, setTableLabel] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Lines to fix before ordering again, by cart line key → reason shown
  const [flagged, setFlagged] = useState<Map<string, string>>(new Map());

  if (!cart) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <i className="fa-solid fa-cart-shopping mb-4 text-5xl text-(--color-border)"></i>
        <p className="text-foreground mb-4 font-semibold">
          Giỏ hàng đang trống.
        </p>
        <Link href="/" className="text-(--color-primary) hover:underline">
          Xem menu để đặt món
        </Link>
      </div>
    );
  }

  const placeOrder = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const order = await orderService.create(
        { paymentMethod: method, tableLabel, note, items: toOrderItems() },
        cart.idempotencyKey,
      );
      if (order.guestToken) guestOrders.save(order.id, order.guestToken);
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      const items =
        err instanceof ApiError
          ? ((err.details.errors as ItemError[]) ?? [])
          : [];
      const keyOf = (i: ItemError) => cart.lines[i.line]?.key;
      if (errorCode(err) === "BR-21") {
        setFlagged(
          new Map(
            items.map((i) => {
              const opt = cart.lines[i.line]?.options.find(
                (o) =>
                  o.optionValueId === i.optionValueId &&
                  o.componentNo === i.componentNo,
              );
              return [
                keyOf(i),
                opt ? `${opt.valueName} đã hết` : "Món này đã ngừng bán",
              ];
            }),
          ),
        );
        setError(
          "Một số món hoặc tuỳ chọn vừa ngừng bán. Hãy xoá các dòng được đánh dấu rồi chọn lại.",
        );
      } else if (errorCode(err) === "BR-18") {
        setFlagged(
          new Map(
            items.map((i) => [
              keyOf(i),
              (i.componentNo ? `Ly ${i.componentNo}: ` : "") +
                (i.message ?? "Tuỳ chọn không còn hợp lệ"),
            ]),
          ),
        );
        setError(
          "Tuỳ chọn của một số món đã thay đổi. Hãy xoá các dòng được đánh dấu rồi thêm lại từ menu.",
        );
      } else if (errorCode(err) === "BR-22") {
        applyPrices(
          items.map((i) => ({ key: keyOf(i), price: i.currentPrice! })),
        );
        setError(
          "Giá một số món đã thay đổi. Giỏ hàng đã cập nhật giá mới, vui lòng kiểm tra rồi đặt lại.",
        );
      } else {
        // Same cart = same Idempotency-Key, so retrying never creates a second order (BR-24)
        setError(`${errorMessage(err)} Bấm "Đặt món" để thử lại.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const qtyButton =
    "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-(--color-border) bg-transparent hover:bg-(--color-border-light)";

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-6 md:px-6 md:py-8 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <section className="min-w-0 flex-1">
          <div className="bg-card overflow-hidden rounded-2xl border border-(--color-border-light)">
            <div className="flex items-center justify-between border-b border-(--color-border-light) px-4 py-3">
              <h1 className="text-foreground text-lg font-bold md:text-xl">
                Giỏ hàng của bạn
              </h1>
              <Link
                href="/"
                className="text-sm text-(--color-primary) hover:underline"
              >
                Thêm món
              </Link>
            </div>
            <ul className="divide-y divide-(--color-border-light)">
              {cart.lines.map((line: CartLine) => {
                const bad = flagged.get(line.key);
                return (
                  <li
                    key={line.key}
                    className={`flex flex-wrap items-center gap-3 px-4 py-3 ${bad ? "bg-red-50" : ""}`}
                  >
                    <div className="min-w-40 flex-1">
                      <p className="text-foreground font-medium">
                        {line.type === "COMBO" && (
                          <span className="mr-1 text-xs text-(--color-primary)">
                            [Combo]
                          </span>
                        )}
                        {line.name}
                      </p>
                      {optionLines(line.options).map((text) => (
                        <p
                          key={text}
                          className="text-xs text-(--color-text-muted)"
                        >
                          {text}
                        </p>
                      ))}
                      <p className="text-sm text-(--color-primary)">
                        {formatVND(line.unitPrice)}
                      </p>
                      {bad && (
                        <p className="text-xs font-semibold text-red-600">
                          {bad}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={qtyButton}
                        aria-label={`Giảm ${line.name}`}
                        onClick={() => setQuantity(line.key, line.quantity - 1)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={MAX_QTY}
                        value={line.quantity}
                        onChange={(e) =>
                          setQuantity(
                            line.key,
                            Math.min(MAX_QTY, Number(e.target.value)),
                          )
                        }
                        className="h-8 w-14 rounded-lg border border-(--color-border) bg-transparent text-center"
                        aria-label={`Số lượng ${line.name}`}
                      />
                      <button
                        type="button"
                        className={qtyButton}
                        aria-label={`Tăng ${line.name}`}
                        disabled={line.quantity >= MAX_QTY}
                        onClick={() => setQuantity(line.key, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <p className="w-24 text-right font-semibold">
                      {formatVND(line.unitPrice * line.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        removeLine(line.key);
                        setFlagged((prev) => {
                          const next = new Map(prev);
                          next.delete(line.key);
                          return next;
                        });
                      }}
                      className="cursor-pointer border-none bg-transparent text-(--color-text-muted) hover:text-red-500"
                      aria-label={`Xoá ${line.name}`}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <aside className="shrink-0 lg:w-85">
          <div className="bg-card sticky top-[calc(var(--spacing-header-height)+1rem)] space-y-4 rounded-2xl border border-(--color-border-light) p-4 md:p-5">
            <h2 className="text-lg font-bold">Thanh toán</h2>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-(--color-text-secondary)">
                Phương thức
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["CASH", "Tiền mặt", "fa-money-bill-wave"],
                    ["QR", "Chuyển khoản QR", "fa-qrcode"],
                  ] as const
                ).map(([value, label, icon]) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${method === value ? "border-(--color-primary) bg-(--color-primary)/5 font-semibold" : "border-(--color-border-light)"}`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={value}
                      checked={method === value}
                      onChange={() => setMethod(value)}
                      className="sr-only"
                    />
                    <i
                      className={`fa-solid ${icon} text-(--color-primary)`}
                    ></i>
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-3 gap-2">
              <label className="col-span-1 text-sm">
                <span className="mb-1 block text-(--color-text-secondary)">
                  Số bàn
                </span>
                <input
                  value={tableLabel}
                  onChange={(e) => setTableLabel(e.target.value)}
                  maxLength={16}
                  placeholder="B05"
                  className="w-full rounded-lg border border-(--color-border) px-2 py-2"
                />
              </label>
              <label className="col-span-2 text-sm">
                <span className="mb-1 block text-(--color-text-secondary)">
                  Ghi chú
                </span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                  placeholder="Ít đá, ít ngọt..."
                  className="w-full rounded-lg border border-(--color-border) px-2 py-2"
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-(--color-border-light) pt-4">
              <span className="text-(--color-text-muted)">Tổng cộng</span>
              <span className="text-xl font-bold text-(--color-primary)">
                {formatVND(totalPrice)}
              </span>
            </div>

            <Alert message={error} />

            <button
              type="button"
              onClick={placeOrder}
              disabled={submitting || flagged.size > 0}
              className="w-full cursor-pointer rounded-xl border-none bg-(--color-primary) py-3 font-semibold text-white transition hover:bg-(--color-primary-dark) disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Đang đặt món..." : "Đặt món"}
            </button>
            <p className="text-xs text-(--color-text-muted)">
              Sau khi đặt, đơn chờ quán xác nhận đã thu tiền. Đơn chưa thanh
              toán sẽ tự huỷ sau 15 phút.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
