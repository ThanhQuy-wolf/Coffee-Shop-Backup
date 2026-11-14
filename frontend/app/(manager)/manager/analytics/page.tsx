"use client";

import {
  AnalyticsHeader,
  ProductAnalysisSection,
  RevenueChartSection,
  SummarySection,
  TopProductsSection,
  useAnalytics,
} from "@/components/organisms/analytics";
import type { AnalyticsPeriod } from "@/lib/types";
import { useState } from "react";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("month");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const a = useAnalytics(period, categoryFilter);

  return (
    <div className="bg-background min-h-screen">
      <AnalyticsHeader period={period} onPeriodChange={setPeriod} />

      <main className="mx-auto max-w-screen-2xl space-y-6 p-4 pb-10">
        <SummarySection
          period={period}
          totalRevenue={a.totalRevenue}
          totalOrders={a.totalOrders}
          totalProfit={a.totalProfit}
          avgOrderValue={a.avgOrderValue}
          revComp={a.revComp}
          ordComp={a.ordComp}
          proComp={a.proComp}
        />

        <RevenueChartSection
          period={period}
          revenueData={a.revenueData}
          barCurrent={a.barCurrent}
          barPrevious={a.barPrevious}
          pieData={a.pieData}
        />

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
