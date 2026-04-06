"use client";

import { Button, Heading, Text, Textarea } from "@/components/atoms";
import { useState } from "react";

import type { ReviewModalProps } from "./Modal.types";

export default function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleClose = () => {
    // Reset state when closing
    setRating(0);
    setHovered(0);
    setReview("");
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-(--color-border-light) bg-white p-6 shadow-xl sm:p-8">
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
              Hãy cho chúng tôi biết trải nghiệm của bạn hôm nay
            </p>

            {/* Star rating */}
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
                  {
                    ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"][
                      rating
                    ]
                  }
                </p>
              )}
            </div>

            {/* Review textarea */}
            <div className="mb-6">
              <Textarea
                id="review-text"
                label="Nhận xét (tùy chọn)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về đồ uống, dịch vụ..."
                rows={4}
              />
            </div>

            {/* Footer buttons */}
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
                disabled={rating === 0}
                className="flex-1"
                icon="fa-check"
              >
                Xác nhận
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
