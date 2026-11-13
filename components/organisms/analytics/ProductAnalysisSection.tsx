"use client";

import type { ProductSalesStats } from "@/lib/types";
import { formatCurrencyFull } from "@/lib/utils/analytics";

import { CategorySelect } from "./CategorySelect";
import { ProductTable } from "./ProductTable";

export interface ProductAnalysisSectionProps {
  filteredSales: ProductSalesStats[];
  categoryFilter: string;
  onCategoryChange: (id: string) => void;
  filteredRevenue: number;
  filteredProfit: number;
  filteredUnits: number;
  avgMargin: number;
}

/** Sortable product table + totals row. */
export function ProductAnalysisSection({
  filteredSales,
  categoryFilter,
  onCategoryChange,
  filteredRevenue,
  filteredProfit,
  filteredUnits,
  avgMargin,
}: ProductAnalysisSectionProps) {
  return (
    <section className="rounded-2xl border border-(--color-border-light) bg-(--color-bg-card) p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-foreground text-base font-semibold">
          <i className="fa-solid fa-table text-foreground mr-2"></i>
          Phân tích chi tiết sản phẩm
        </h2>
        <CategorySelect
          value={categoryFilter}
          onChange={onCategoryChange}
          label="Lọc danh mục:"
        />
      </div>
      <p className="mb-3 text-xs text-(--color-text-muted)">
        Click vào tiêu đề cột để sắp xếp. Hiển thị {filteredSales.length} sản
        phẩm.
      </p>
      <ProductTable data={filteredSales} />

      {/* Summary row */}
      <div className="bg-background mt-4 flex flex-wrap gap-4 rounded-xl p-4 text-sm">
        <div>
          <span className="text-(--color-text-muted)">Tổng doanh thu: </span>
          <span className="font-semibold text-(--color-primary)">
            {formatCurrencyFull(filteredRevenue)}
          </span>
        </div>
        <div>
          <span className="text-(--color-text-muted)">Tổng lợi nhuận: </span>
          <span className="font-semibold text-green-600">
            {formatCurrencyFull(filteredProfit)}
          </span>
        </div>
        <div>
          <span className="text-(--color-text-muted)">Tổng sản lượng: </span>
          <span className="text-foreground font-semibold">
            {filteredUnits.toLocaleString()} ly
          </span>
        </div>
        <div>
          <span className="text-(--color-text-muted)">
            Biên LN trung bình:{" "}
          </span>
          <span className="font-semibold text-yellow-700">
            {avgMargin.toFixed(1)}%
          </span>
        </div>
      </div>
    </section>
  );
}
