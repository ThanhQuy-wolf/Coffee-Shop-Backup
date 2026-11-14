"use client";

import { useCatalog } from "@/lib/contexts/catalog-context";
import type { ProductSalesStats } from "@/lib/types";
import { formatNumber, formatVND } from "@/lib/utils/currency";
import { useMemo, useState } from "react";

interface ProductTableProps {
  data: ProductSalesStats[];
}

type SortKey = keyof ProductSalesStats;
type SortDir = "asc" | "desc";

/**
 * Table header cell that sorts by its column when clicked and shows the
 * current direction.
 * @param props.col Column this header sorts by.
 * @param props.label Header text.
 * @param props.className Extra classes.
 * @param props.sortKey Column the table is sorted by now.
 * @param props.sortDir Current direction.
 * @param props.onSort Called with `col` on click.
 */
function SortTh({
  col,
  label,
  className = "",
  sortKey,
  sortDir,
  onSort,
}: {
  col: SortKey;
  label: string;
  className?: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (col: SortKey) => void;
}) {
  const icon =
    sortKey === col
      ? sortDir === "desc"
        ? "fa-sort-down text-(--color-primary)"
        : "fa-sort-up text-(--color-primary)"
      : "fa-sort text-(--color-text-muted)";
  return (
    <th
      className={`cursor-pointer px-4 py-3 font-semibold text-(--color-text-secondary) hover:text-(--color-primary) ${className}`}
      onClick={() => onSort(col)}
    >
      {label} <i className={`fa-solid ml-1 text-xs ${icon}`} />
    </th>
  );
}

/**
 * Product sales table. Clicking a header sorts by that column; clicking it
 * again reverses the order.
 * @param props.data Rows to show.
 */
export function ProductTable({ data }: ProductTableProps) {
  const { categories } = useCatalog();
  const categoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? `#${id}`;
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(
    () =>
      [...data].sort((a, b) => {
        const av = a[sortKey] as number;
        const bv = b[sortKey] as number;
        return sortDir === "desc" ? bv - av : av - bv;
      }),
    [data, sortKey, sortDir],
  );

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-(--color-border-light)">
      <table className="w-full min-w-175 text-sm">
        <thead>
          <tr className="bg-background border-b border-(--color-border-light)">
            <th className="px-4 py-3 text-left font-semibold text-(--color-text-secondary)">
              #
            </th>
            <th className="px-4 py-3 text-left font-semibold text-(--color-text-secondary)">
              Sản phẩm
            </th>
            <th className="px-4 py-3 text-left font-semibold text-(--color-text-secondary)">
              Danh mục
            </th>
            <SortTh
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              col="unitsSold"
              label="Số lượng"
              className="text-right"
            />
            <SortTh
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              col="revenue"
              label="Doanh thu"
              className="text-right"
            />
            <th className="px-4 py-3 text-right font-semibold text-(--color-text-secondary)">
              Giá vốn
            </th>
            <th className="px-4 py-3 text-right font-semibold text-(--color-text-secondary)">
              Giá bán
            </th>
            <SortTh
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              col="profit"
              label="Lợi nhuận"
              className="text-right"
            />
            <SortTh
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              col="profitMargin"
              label="Biên LN"
              className="text-right"
            />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.productId}
              className="border-b border-(--color-border-light) bg-(--color-bg-card) transition-colors hover:bg-(--color-accent-light)/30"
            >
              <td className="px-4 py-3 text-(--color-text-muted)">{i + 1}</td>
              <td className="text-foreground px-4 py-3 font-medium">
                {row.name}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-(--color-accent-light) px-2 py-0.5 text-xs text-(--color-primary)">
                  {categoryName(row.categoryId)}
                </span>
              </td>
              <td className="text-foreground px-4 py-3 text-right tabular-nums">
                {formatNumber(row.unitsSold)}
              </td>
              <td className="px-4 py-3 text-right font-medium text-(--color-primary) tabular-nums">
                {formatVND(row.revenue)}
              </td>
              <td className="px-4 py-3 text-right text-(--color-text-muted) tabular-nums">
                {row.missingCost ? (
                  <span
                    className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700"
                    title="BR-10: chưa khai báo giá vốn"
                  >
                    Chưa có giá vốn
                  </span>
                ) : (
                  formatVND(row.costPrice)
                )}
              </td>
              <td className="px-4 py-3 text-right text-(--color-text-secondary) tabular-nums">
                {formatVND(row.sellingPrice)}
              </td>
              <td className="px-4 py-3 text-right font-medium text-green-600 tabular-nums">
                {row.missingCost ? "—" : formatVND(row.profit)}
              </td>
              <td className="px-4 py-3 text-right">
                {row.missingCost ? (
                  <span className="text-xs text-(--color-text-muted)">—</span>
                ) : (
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      row.profitMargin >= 70
                        ? "bg-green-100 text-green-700"
                        : row.profitMargin >= 60
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-600"
                    }`}
                  >
                    {row.profitMargin.toFixed(1)}%
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
