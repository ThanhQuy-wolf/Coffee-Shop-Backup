"use client";

import { Alert } from "@/components/atoms";
import { reviewService } from "@/lib/services";
import type { ReviewList } from "@/lib/types";
import { errorMessage } from "@/lib/utils/errors";
import { formatDateTime } from "@/lib/utils/order";
import { useEffect, useState } from "react";

const PAGE_SIZE = 10;

/**
 * Manager tab with customer reviews (UC-17, R-2): the average rating, the
 * count per star, a star filter and pages of 10 reviews.
 */
export default function ReviewsTab() {
  const [rating, setRating] = useState(0);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ReviewList | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reviewService
      .list({
        rating: rating || undefined,
        page,
        size: PAGE_SIZE,
      })
      .then(setData, (err) => setError(errorMessage(err)));
  }, [rating, page]);

  if (error) return <Alert message={error} />;
  if (!data) return null;

  const totalAll = Object.values(data.countByRating).reduce((s, n) => s + n, 0);
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="h-fit rounded-2xl border border-(--color-border-light) bg-white p-5 shadow-sm">
        <p className="text-4xl font-bold text-(--color-primary)">
          {data.average.toFixed(1)}
        </p>
        <p className="mb-4 text-sm text-(--color-text-muted)">
          {totalAll} đánh giá
        </p>
        <ul className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = data.countByRating[star as 1 | 2 | 3 | 4 | 5];
            return (
              <li key={star}>
                <button
                  type="button"
                  aria-pressed={rating === star}
                  onClick={() => {
                    setRating(rating === star ? 0 : star);
                    setPage(1);
                  }}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border-none px-2 py-1 text-sm ${rating === star ? "bg-(--color-accent-light)" : "bg-transparent"}`}
                >
                  <span className="w-8 text-left">{star}★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-(--color-border-light)">
                    <span
                      className="block h-full bg-yellow-400"
                      style={{
                        width: `${totalAll ? (count / totalAll) * 100 : 0}%`,
                      }}
                    />
                  </span>
                  <span className="w-6 text-right text-(--color-text-muted)">
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-3">
        {data.items.length === 0 && (
          <p className="text-(--color-text-muted)">Chưa có đánh giá nào.</p>
        )}
        {data.items.map((r) => (
          <article
            key={r.id}
            className="rounded-2xl border border-(--color-border-light) bg-white p-4 shadow-sm"
          >
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <p className="text-foreground font-semibold">{r.customerName}</p>
              <p className="text-xs text-(--color-text-muted)">
                {r.orderCode} · {formatDateTime(r.createdAt)}
              </p>
            </div>
            <p className="text-yellow-500" aria-label={`${r.rating} sao`}>
              {"★".repeat(r.rating)}
              <span className="text-(--color-border)">
                {"★".repeat(5 - r.rating)}
              </span>
            </p>
            {r.comment && (
              <p className="mt-1 text-sm text-(--color-text-secondary)">
                {r.comment}
              </p>
            )}
          </article>
        ))}
        {pages > 1 && (
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="cursor-pointer rounded-lg border border-(--color-border) bg-white px-3 py-1 disabled:opacity-40"
            >
              Trước
            </button>
            <span>
              {page} / {pages}
            </span>
            <button
              type="button"
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
              className="cursor-pointer rounded-lg border border-(--color-border) bg-white px-3 py-1 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
