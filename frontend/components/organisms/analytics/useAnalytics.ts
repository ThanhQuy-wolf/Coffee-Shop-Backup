"use client";

import { ALL_CATEGORY_ID, analyticsService } from "@/lib/services";
import type {
  AnalyticsPeriod,
  ProductSalesStats,
  ReportSummary,
  RevenueReport,
} from "@/lib/types";
import { errorMessage } from "@/lib/utils/errors";
import { useEffect, useMemo, useState } from "react";

import type { PieSlice } from "./PieChart";
import { CATEGORY_COLORS } from "./constants";

/**
 * Loads RP-1 → RP-3 for one period and derives the numbers the analytics
 * sections show. Reloads when the period changes; the category filter only
 * changes the derived numbers.
 * @param period Reporting period.
 * @param categoryFilter Category id, or `ALL_CATEGORY_ID`.
 * @returns Loading and error state, the raw reports and the derived figures
 *   (chart data, top 5, filtered totals and margin).
 */
export function useAnalytics(period: AnalyticsPeriod, categoryFilter: number) {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [sales, setSales] = useState<ProductSalesStats[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      analyticsService.getSummary(period),
      analyticsService.getRevenue(period),
    ]).then(
      ([s, r]) => {
        if (!alive) return;
        setSummary(s);
        setRevenue(r);
      },
      (err) => alive && setError(errorMessage(err)),
    );
    return () => {
      alive = false;
    };
  }, [period]);

  useEffect(() => {
    let alive = true;
    analyticsService
      .getProductSales(
        categoryFilter === ALL_CATEGORY_ID ? undefined : categoryFilter,
      )
      .then(
        (rows) => alive && setSales(rows),
        (err) => alive && setError(errorMessage(err)),
      );
    return () => {
      alive = false;
    };
  }, [categoryFilter]);

  const pieData = useMemo(
    (): PieSlice[] =>
      (revenue?.byCategory ?? [])
        .map((c, i) => ({
          label: c.name,
          value: c.revenue,
          color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        }))
        .sort((a, b) => b.value - a.value),
    [revenue],
  );

  const top5 = useMemo(
    () => [...sales].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    [sales],
  );

  // Rows without a cost price would show a fake 100% margin (BR-10)
  const withCost = sales.filter((d) => !d.missingCost);

  return {
    error,
    summary,
    revenueData: revenue?.series ?? [],
    barCurrent: revenue?.currentHalf ?? [],
    barPrevious: revenue?.previousHalf ?? [],
    pieData,
    top5,
    filteredSales: sales,
    filteredRevenue: sales.reduce((s, d) => s + d.revenue, 0),
    filteredProfit: withCost.reduce((s, d) => s + d.profit, 0),
    filteredUnits: sales.reduce((s, d) => s + d.unitsSold, 0),
    avgMargin: withCost.length
      ? withCost.reduce((s, d) => s + d.profitMargin, 0) / withCost.length
      : 0,
  };
}
