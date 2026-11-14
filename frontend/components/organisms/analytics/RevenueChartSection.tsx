"use client";

import type { AnalyticsPeriod, RevenueDataPoint } from "@/lib/types";
import { useState } from "react";

import { BarChart } from "./BarChart";
import { LineChart } from "./LineChart";
import { PieChart, type PieSlice } from "./PieChart";
import { PERIOD_LABELS } from "./constants";

const CHART_TYPES = ["line", "bar", "pie"] as const;
type ChartType = (typeof CHART_TYPES)[number];

const CHART_META: Record<ChartType, { icon: string; label: string }> = {
  line: { icon: "fa-chart-line", label: "Line" },
  bar: { icon: "fa-chart-bar", label: "Bar" },
  pie: { icon: "fa-chart-pie", label: "Pie" },
};

export interface RevenueChartSectionProps {
  period: AnalyticsPeriod;
  revenueData: RevenueDataPoint[];
  barCurrent: RevenueDataPoint[];
  barPrevious: RevenueDataPoint[];
  pieData: PieSlice[];
}

/**
 * Revenue chart card with a line, bar and pie switcher.
 * @param props.period Period, used in the titles.
 * @param props.revenueData Points for the line chart.
 * @param props.barCurrent Current period points for the bar chart.
 * @param props.barPrevious Previous period points for the bar chart.
 * @param props.pieData Revenue by category for the pie chart.
 */
export function RevenueChartSection({
  period,
  revenueData,
  barCurrent,
  barPrevious,
  pieData,
}: RevenueChartSectionProps) {
  const [activeChart, setActiveChart] = useState<ChartType>("line");

  return (
    <section className="bg-background rounded-2xl border border-(--color-border-light) p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-foreground text-base font-semibold">
          <i className="fa-solid fa-chart-area mr-2 text-(--color-primary)"></i>
          Biểu đồ doanh thu
        </h2>
        <div className="flex gap-2">
          {CHART_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActiveChart(t)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeChart === t
                  ? "bg-(--color-primary) text-white"
                  : "bg-background text-(--color-text-muted) hover:bg-(--color-accent-light)"
              }`}
            >
              <i className={`fa-solid text-xs ${CHART_META[t].icon}`}></i>
              <span className="hidden sm:inline">{CHART_META[t].label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeChart === "line" && (
        <>
          <p className="mb-3 text-xs text-(--color-text-muted)">
            Doanh thu theo thời gian — {PERIOD_LABELS[period]}
          </p>
          <LineChart data={revenueData} height={220} />
        </>
      )}
      {activeChart === "bar" && (
        <>
          <p className="mb-3 text-xs text-(--color-text-muted)">
            So sánh doanh thu nửa đầu và nửa sau kỳ hiện tại
          </p>
          <BarChart current={barCurrent} previous={barPrevious} height={220} />
        </>
      )}
      {activeChart === "pie" && (
        <>
          <p className="mb-3 text-xs text-(--color-text-muted)">
            Tỷ trọng doanh thu theo danh mục sản phẩm
          </p>
          <PieChart data={pieData} />
        </>
      )}
    </section>
  );
}
