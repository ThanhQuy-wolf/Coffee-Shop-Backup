import Button from "@/components/atoms/buttons/Button";
import { ReviewModal } from "@/components/organisms/modals";
import Link from "next/link";
import { useState } from "react";

import type { PaymentSummaryCardProps } from "./Card.types";

const formatPrice = (value: number) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function PaymentSummaryCard({
  totalPrice,
  isCustomer = false,
  backHref,
}: PaymentSummaryCardProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const handlePayment = () => {
    // UI-only: open review modal after "payment"
    if (isCustomer) {
      setIsReviewOpen(true);
    }
  };
  return (
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
          <Button
            style="payment"
            onClick={handlePayment}
            icon="fa-solid fa-money-bill-wave"
            size="md"
            variant="primary"
          >
            Tiền mặt
          </Button>

          <Button
            style="payment"
            onClick={handlePayment}
            icon="fa-solid fa-qrcode"
            size="md"
            variant="secondary"
          >
            QR Code
          </Button>

          {isCustomer && (
            <Button
              style="payment"
              onClick={handlePayment}
              icon="fa-solid fa-star"
              size="md"
              variant="primary"
            >
              Đánh giá
            </Button>
          )}

          <Link
            href={backHref || "/"}
            className={isCustomer ? "" : "col-span-2"}
          >
            <Button
              style="payment"
              onClick={() => setIsReviewOpen(false)}
              icon="fa-solid fa-arrow-rotate-left"
              size="md"
              variant="secondary"
              className="w-full"
            >
              Quay về
            </Button>
          </Link>
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
      />
    </aside>
  );
}
