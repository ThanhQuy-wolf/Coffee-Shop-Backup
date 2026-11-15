"use client";

import { Alert, Spinner } from "@/components/atoms";
import {
  AnalyticsHeader,
  ProductAnalysisSection,
  RevenueChartSection,
  SummarySection,
  TopProductsSection,
  useAnalytics,
} from "@/components/organisms/analytics";
import { ALL_CATEGORY_ID } from "@/lib/services";
import type { AnalyticsPeriod } from "@/lib/types";
import { useState } from "react";

/** Revenue and product reports for the manager (UC-23, RP-1 → RP-3). */
export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("month");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORY_ID);
  const a = useAnalytics(period, categoryFilter);

  return (
    <div className="bg-background min-h-screen">
      <AnalyticsHeader period={period} onPeriodChange={setPeriod} />

      <main className="mx-auto max-w-screen-2xl space-y-6 p-4 pb-10">
        <Alert message={a.error} />
        {!a.summary && !a.error && (
          <Spinner label="Đang tải số liệu..." className="py-16" />
        )}
        {a.summary && <SummarySection period={period} summary={a.summary} />}

        {/* The SVG charts need at least one point to compute their scales */}
        {a.revenueData.length > 0 && (
          <RevenueChartSection
            period={period}
            revenueData={a.revenueData}
            barCurrent={a.barCurrent}
            barPrevious={a.barPrevious}
            pieData={a.pieData}
          />
        )}

        <TopProductsSection
          top5={a.top5}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />

        <ProductAnalysisSection
          filteredSales={a.filteredSales}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          filteredRevenue={a.filteredRevenue}
          filteredProfit={a.filteredProfit}
          filteredUnits={a.filteredUnits}
          avgMargin={a.avgMargin}
        />
      </main>
    </div>
  );
}
