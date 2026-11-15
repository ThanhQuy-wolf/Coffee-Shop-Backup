"use client";

import { Icon } from "@/components/atoms";
import type { ProductSalesStats } from "@/lib/types";
import { formatNumber, formatVND } from "@/lib/utils/currency";

import { CategorySelect } from "./CategorySelect";
import { ProductTable } from "./ProductTable";

export interface ProductAnalysisSectionProps {
  filteredSales: ProductSalesStats[];
  categoryFilter: number;
  onCategoryChange: (id: number) => void;
  filteredRevenue: number;
  filteredProfit: number;
  filteredUnits: number;
  avgMargin: number;
}

/**
 * Product analysis card: category filter, totals row and sortable table.
 * @param props.filteredSales Product rows after the category filter.
 * @param props.categoryFilter Selected category id.
 * @param props.onCategoryChange Called with a new category id.
 * @param props.filteredRevenue Revenue of the filtered rows.
 * @param props.filteredProfit Profit of the filtered rows.
 * @param props.filteredUnits Units sold in the filtered rows.
 * @param props.avgMargin Average margin in percent.
 */
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
          <Icon name="table" className="text-foreground mr-2" />
          Phân tích chi tiết sản phẩm
        </h2>
        <CategorySelect
          value={categoryFilter}
          onChange={onCategoryChange}
          label="Lọc danh mục:"
        />
      </div>
      <p className="mb-3 text-xs text-(--color-text-muted)">
        Nhấn vào tiêu đề cột để sắp xếp
        <span className="sm:hidden">, vuốt ngang để xem thêm cột</span>. Hiển
        thị {filteredSales.length} sản phẩm.
      </p>
      <ProductTable data={filteredSales} />

      <div className="bg-background mt-4 flex flex-wrap gap-4 rounded-xl p-4 text-sm">
        <div>
          <span className="text-(--color-text-muted)">Tổng doanh thu: </span>
          <span className="font-semibold text-(--color-primary)">
            {formatVND(filteredRevenue)}
          </span>
        </div>
        <div>
          <span className="text-(--color-text-muted)">Tổng lợi nhuận: </span>
          <span className="font-semibold text-(--color-success)">
            {formatVND(filteredProfit)}
          </span>
        </div>
        <div>
          <span className="text-(--color-text-muted)">Tổng sản lượng: </span>
          <span className="text-foreground font-semibold">
            {formatNumber(filteredUnits)} ly
          </span>
        </div>
        <div>
          <span className="text-(--color-text-muted)">
            Biên LN trung bình:{" "}
          </span>
          <span className="font-semibold text-(--color-warning)">
            {avgMargin.toFixed(1)}%
          </span>
        </div>
      </div>
    </section>
  );
}
