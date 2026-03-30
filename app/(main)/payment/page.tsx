"use client";

import { useCart } from "@/lib/cart-context";
import Link from "next/link";

const formatPrice = (value: number) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function PaymentPage() {
  const {
    items,
    totalPrice,
    increaseQty,
    decreaseQty,
    removeFromCart,
    setQuantity,
  } = useCart();

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 md:px-6 md:py-8 lg:px-8">
      <div className="flex flex-col gap-6 xl:flex-row">
        <section className="min-w-0 flex-1">
          <div className="bg-card overflow-hidden rounded-2xl border border-(--color-border-light)">
            <div className="border-b border-(--color-border-light) px-4 py-3">
              <h1 className="text-foreground text-lg font-bold md:text-xl">
                Trang thanh toán
              </h1>
            </div>

            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-(--color-text-muted)">
                Chưa có sản phẩm nào trong giỏ hàng.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-190 text-sm">
                  <thead>
                    <tr className="bg-(--color-border-light)/40 text-left">
                      <th className="px-4 py-3 font-semibold">Tên sản phẩm</th>
                      <th className="px-4 py-3 font-semibold">Giá tiền</th>
                      <th className="px-4 py-3 font-semibold">Mô tả</th>
                      <th className="px-4 py-3 font-semibold">Số lượng</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Xóa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-(--color-border-light)"
                      >
                        <td className="text-foreground px-4 py-3 font-medium">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 font-semibold text-(--color-primary)">
                          {formatPrice(item.price)}
                        </td>
                        <td className="max-w-70 px-4 py-3 text-(--color-text-muted)">
                          <p className="line-clamp-2">{item.description}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => decreaseQty(item.id)}
                              className="h-8 w-8 rounded-lg border border-(--color-border) hover:bg-(--color-border-light)"
                              aria-label={`Giảm số lượng ${item.name}`}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                setQuantity(item.id, Number(e.target.value))
                              }
                              className="h-8 w-16 rounded-lg border border-(--color-border) bg-transparent text-center"
                              title="Nhập số lượng"
                            />
                            <button
                              onClick={() => increaseQty(item.id)}
                              className="h-8 w-8 rounded-lg border border-(--color-border) hover:bg-(--color-border-light)"
                              aria-label={`Tăng số lượng ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-white transition-colors hover:bg-red-600"
                          >
                            <i className="fa-solid fa-trash"></i>
                            <span className="hidden lg:inline">
                              Xóa sản phẩm
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <aside className="shrink-0 xl:w-85">
          <div className="bg-card sticky top-[calc(var(--spacing-header-height)+1rem)] rounded-2xl border border-(--color-border-light) p-4 md:p-5">
            <h2 className="mb-4 text-lg font-bold">Hóa đơn</h2>

            <div className="flex items-center justify-between border-b border-(--color-border-light) pb-4">
              <span className="text-(--color-text-muted)">Tổng cộng</span>
              <span className="text-xl font-bold text-(--color-primary)">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-3 py-2.5 text-white transition-colors hover:bg-(--color-primary-dark)"
                type="button"
              >
                <i className="fa-solid fa-money-bill-wave"></i>
                <span className="hidden lg:inline">Tiền mặt</span>
              </button>

              <button
                className="text-foreground inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-(--color-border) px-3 py-2.5 transition-colors hover:bg-(--color-border-light)"
                type="button"
              >
                <i className="fa-solid fa-qrcode"></i>
                <span className="hidden lg:inline">QR Code</span>
              </button>

              <Link href="/">
                <button
                  className="text-foreground inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-(--color-border) px-3 py-2.5 transition-colors hover:bg-(--color-border-light)"
                  type="button"
                >
                  <i className="fa-solid fa-arrow-rotate-left"></i>
                  <span className="hidden lg:inline">Quay về</span>
                </button>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
