"use client";

import Link from 'next/link';
import { useCart } from "@/lib/cart-context";

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
    <div className="max-w-screen-2xl mx-auto w-full px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <div className="flex flex-col xl:flex-row gap-6">
        <section className="flex-1 min-w-0">
          <div className="rounded-2xl border border-(--color-border-light) bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-(--color-border-light)">
              <h1 className="text-lg md:text-xl font-bold text-foreground">Trang thanh toán</h1>
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
                      <th className="px-4 py-3 font-semibold text-right">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-(--color-border-light)">
                        <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                        <td className="px-4 py-3 text-(--color-primary) font-semibold">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-4 py-3 text-(--color-text-muted) max-w-70">
                          <p className="line-clamp-2">{item.description}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => decreaseQty(item.id)}
                              className="w-8 h-8 rounded-lg border border-(--color-border) hover:bg-(--color-border-light)"
                              aria-label={`Giảm số lượng ${item.name}`}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                              className="w-16 h-8 text-center rounded-lg border border-(--color-border) bg-transparent"
                              title='Nhập số lượng'
                            />
                            <button
                              onClick={() => increaseQty(item.id)}
                              className="w-8 h-8 rounded-lg border border-(--color-border) hover:bg-(--color-border-light)"
                              aria-label={`Tăng số lượng ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            <i className="fa-solid fa-trash"></i>
                            <span className="hidden lg:inline">Xóa sản phẩm</span>
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

        <aside className="xl:w-85 shrink-0">
          <div className="sticky top-[calc(var(--spacing-header-height)+1rem)] rounded-2xl border border-(--color-border-light) bg-card p-4 md:p-5">
            <h2 className="text-lg font-bold mb-4">Hóa đơn</h2>

            <div className="flex items-center justify-between pb-4 border-b border-(--color-border-light)">
              <span className="text-(--color-text-muted)">Tổng cộng</span>
              <span className="text-xl font-bold text-(--color-primary)">{formatPrice(totalPrice)}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 bg-(--color-primary) text-white hover:bg-(--color-primary-dark) transition-colors cursor-pointer"
                type="button"
              >
                <i className="fa-solid fa-money-bill-wave"></i>
                <span className="hidden lg:inline">Tiền mặt</span>
              </button>

              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 border border-(--color-border) text-foreground hover:bg-(--color-border-light) transition-colors cursor-pointer"
                type="button"
              >
                <i className="fa-solid fa-qrcode"></i>
                <span className="hidden lg:inline">QR Code</span>
              </button>

              <Link href="/">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 border border-(--color-border) text-foreground hover:bg-(--color-border-light) transition-colors cursor-pointer"
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
