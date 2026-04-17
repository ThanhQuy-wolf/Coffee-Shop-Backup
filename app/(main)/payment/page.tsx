"use client";

import Button from "@/components/atoms/buttons/Button";
import PaymentSummaryCard from "@/components/molecules/cards/PaymentSummaryCard";
import ReviewModal from "@/components/organisms/modals/ReviewModal";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

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
  const { user } = useAuth();

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const isCustomer = user?.role === "customer";

  return (
    <div>
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
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Tên sản phẩm
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Giá tiền
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Mô tả
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Số lượng
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right font-semibold"
                        >
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
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-(--color-border) hover:bg-(--color-border-light)"
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
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-(--color-border) hover:bg-(--color-border-light)"
                                aria-label={`Tăng số lượng ${item.name}`}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              onClick={() => removeFromCart(item.id)}
                              variant="danger"
                              size="md"
                              style="payment"
                              aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                            >
                              Xóa sản phẩm
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <PaymentSummaryCard
            totalPrice={totalPrice}
            isCustomer={isCustomer}
            backHref="/"
          />
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
      />
    </div>
  );
}
