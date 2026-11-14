"use client";

import { Alert, Button, Heading, Text, Textarea } from "@/components/atoms";
import { Modal } from "@/components/molecules/modal";
import { reviewService } from "@/lib/services";
import { errorMessage } from "@/lib/utils/errors";
import { useState } from "react";

import type { ReviewModalProps } from "./Modal.types";

const COMMENT_MAX = 500; // BR-31

/**
 * Dialog for reviewing a completed order with 1–5 stars and an optional
 * comment. One review per order, and it cannot be edited afterwards (UC-16).
 * @param props.orderId The order being reviewed.
 * @param props.orderCode Shown in the title.
 * @param props.onClose Called on cancel or close.
 * @param props.onSubmitted Called with the saved review.
 */
export default function ReviewModal({
  orderId,
  orderCode,
  onClose,
  onSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    setSending(true);
    setError(null);
    try {
      const saved = await reviewService.create(orderId, {
        rating,
        comment: review,
      });
      setSubmitted(true);
      onSubmitted(saved);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleClose = onClose;

  return (
    <Modal
      onClose={handleClose}
      labelledBy="review-modal-title"
      className="max-w-md border border-(--color-border-light) p-6 sm:p-8"
    >
      {submitted ? (
        /* Thank you state */
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--color-accent-light) text-3xl">
            <i className="fa-solid fa-heart text-(--color-accent)"></i>
          </div>
          <Heading level={2} id="review-modal-title">
            Cảm ơn quý khách
          </Heading>
          <Text variant="body2" className="mt-2">
            Chúng tôi trân trọng đánh giá của bạn!
          </Text>
          <Button onClick={handleClose} variant="primary" className="mt-4">
            Đóng
          </Button>
        </div>
      ) : (
        /* Review form */
        <>
          <h2
            id="review-modal-title"
            className="text-foreground mb-1 text-xl font-bold"
          >
            Đánh giá của bạn
          </h2>
          <p className="mb-5 text-sm text-(--color-text-muted)">
            Đơn {orderCode}. Đánh giá chỉ gửi được một lần.
          </p>

          <div className="mb-5">
            <p className="mb-2 text-sm font-medium text-(--color-text-secondary)">
              Mức độ hài lòng
            </p>
            <div
              className="flex gap-2"
              role="radiogroup"
              aria-label="Xếp hạng sao"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hovered || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    aria-label={`${star} sao`}
                    aria-pressed={rating === star}
                    className="text-3xl transition-transform hover:scale-110 active:scale-95 sm:text-4xl"
                  >
                    <i
                      className={
                        isActive
                          ? "fa-solid fa-star text-yellow-400"
                          : "fa-regular fa-star text-(--color-border)"
                      }
                    ></i>
                  </button>
                );
              })}
            </div>
            {rating > 0 && (
              <p className="mt-1.5 text-xs text-(--color-text-muted)">
                {["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"][rating]}
              </p>
            )}
          </div>

          <div className="mb-6">
            <Textarea
              id="review-text"
              label="Nhận xét (tùy chọn)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về đồ uống, dịch vụ..."
              rows={4}
              maxLength={COMMENT_MAX}
            />
            <p className="mt-1 text-right text-xs text-(--color-text-muted)">
              {review.length}/{COMMENT_MAX}
            </p>
          </div>

          <Alert message={error} className="mb-4" />

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              className="flex-1"
              icon="fa-arrow-left"
            >
              Quay lại
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0 || sending}
              className="flex-1"
              icon="fa-check"
            >
              Xác nhận
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
