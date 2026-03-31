"use client";

import { useState } from "react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
            <h2
              id="review-modal-title"
              className="text-foreground text-xl font-bold"
            >
              Cảm ơn quý khách
            </h2>
            <p className="text-(--color-text-muted)">
              Chúng tôi trân trọng đánh giá của bạn!
            </p>
            <button
              onClick={handleClose}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-6 py-2.5 text-white transition-colors hover:bg-(--color-primary-dark)"
            >
              Đóng
            </button>
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
              <label
                htmlFor="review-text"
                className="mb-2 block text-sm font-medium text-(--color-text-secondary)"
              >
                Nhận xét (tùy chọn)
              </label>
              <textarea
                id="review-text"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về đồ uống, dịch vụ..."
                rows={4}
                className="text-foreground w-full resize-none rounded-xl border border-(--color-border) bg-transparent px-3 py-2.5 text-sm transition-colors placeholder:text-(--color-text-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 focus:outline-none"
              />
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="text-foreground inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-(--color-border) px-4 py-2.5 text-sm font-medium transition-colors hover:bg-(--color-border-light)"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={rating === 0}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-primary-dark) disabled:cursor-not-allowed disabled:opacity-50"
              >
                <i className="fa-solid fa-check"></i>
                Xác nhận
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
