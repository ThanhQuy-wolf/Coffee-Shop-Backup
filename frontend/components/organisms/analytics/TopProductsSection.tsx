"use client";

import type { ProductSalesStats } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/analytics";

import { CategorySelect } from "./CategorySelect";

export interface TopProductsSectionProps {
  top5: ProductSalesStats[];
  categoryFilter: number;
  onCategoryChange: (id: number) => void;
}

/** Top-5 best sellers with revenue bars. */
export function TopProductsSection({
  top5,
  categoryFilter,
  onCategoryChange,
}: TopProductsSectionProps) {
  return (
    <section className="rounded-2xl border border-(--color-border-light) bg-(--color-bg-card) p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-foreground text-base font-semibold">
          <i className="fa-solid fa-fire mr-2 text-orange-500"></i>
          Top sản phẩm bán chạy
        </h2>
        <CategorySelect value={categoryFilter} onChange={onCategoryChange} />
      </div>
      <div className="space-y-3">
        {top5.length === 0 && (
          <p className="text-sm text-(--color-text-muted)">
            Chưa có dữ liệu bán hàng.
          </p>
        )}
        {top5.map((p, i) => {
          const pct = (p.revenue / top5[0].revenue) * 100;
          return (
            <div key={p.productId}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--color-accent-light) text-xs font-bold text-(--color-primary)">
                    {i + 1}
                  </span>
                  <span className="text-foreground truncate text-sm font-medium">
                    {p.name}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs">
                  <span className="text-(--color-text-muted) tabular-nums">
                    {p.unitsSold} ly
                  </span>
                  <span className="font-semibold text-(--color-primary) tabular-nums">
                    {formatCurrency(p.revenue)}
                  </span>
                </div>
              </div>
              <div className="bg-background h-2 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-(--color-primary) transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
