"use client";

import {
  BarChart,
  LineChart,
  PieChart,
  ProductTable,
  SummaryCard,
} from "@/components/organisms/analytics";
import type { PieSlice } from "@/components/organisms/analytics";
import {
  calcChange,
  formatCurrency,
  formatCurrencyFull,
} from "@/lib/analytics-utils";
import {
  MENU_CATEGORIES,
  MOCK_PRODUCT_SALES,
  MOCK_REVENUE_DAILY,
  MOCK_REVENUE_MONTHLY,
  MOCK_REVENUE_WEEKLY,
  MOCK_REVENUE_YEARLY,
} from "@/lib/constants";
import type { AnalyticsPeriod, RevenueDataPoint } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  day: "Theo ngày",
  week: "Theo tuần",
  month: "Theo tháng",
  year: "Theo năm",
};

const CATEGORY_COLORS = [
  "#6F4E37",
  "#C8973A",
  "#A0785A",
  "#8B6914",
  "#D4A96A",
  "#4A3728",
  "#F0D9A8",
  "#A08060",
  "#3D2B1F",
];

const REVENUE_MAP: Record<AnalyticsPeriod, RevenueDataPoint[]> = {
  day: MOCK_REVENUE_DAILY,
  week: MOCK_REVENUE_WEEKLY,
  month: MOCK_REVENUE_MONTHLY,
  year: MOCK_REVENUE_YEARLY,
};

const CHART_TYPES = ["line", "bar", "pie"] as const;
type ChartType = (typeof CHART_TYPES)[number];

const CHART_META: Record<ChartType, { icon: string; label: string }> = {
  line: { icon: "fa-chart-line", label: "Line" },
  bar: { icon: "fa-chart-bar", label: "Bar" },
  pie: { icon: "fa-chart-pie", label: "Pie" },
};

// ─── Category filter select ───────────────────────────────────────────────────

function CategorySelect({
  value,
  onChange,
  label = "Danh mục:",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const categories = MENU_CATEGORIES.filter((c) => c.id !== "all");
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-(--color-text-muted)">{label}</label>
      <select
        title="Danh mục"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background text-foreground rounded-lg border border-(--color-border) px-2 py-1.5 text-xs"
      >
        <option value="all">Tất cả</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("month");
  const [activeChart, setActiveChart] = useState<ChartType>("line");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Revenue data for selected period
  const revenueData = REVENUE_MAP[period];

  // Split into halves for bar comparison
  const half = Math.floor(revenueData.length / 2);
  const barCurrent = revenueData.slice(half);
  const barPrevious = revenueData.slice(0, half).slice(0, barCurrent.length);

  // Filtered product sales
  const filteredSales = useMemo(
    () =>
      categoryFilter === "all"
        ? MOCK_PRODUCT_SALES
        : MOCK_PRODUCT_SALES.filter((p) => p.category === categoryFilter),
    [categoryFilter],
  );

  // Summary stats
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = revenueData.reduce((s, d) => s + d.orders, 0);
  const totalProfit = filteredSales.reduce((s, d) => s + d.profit, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Period-over-period comparisons
  const curRevenue = barCurrent.reduce((s, d) => s + d.revenue, 0);
  const prevRevenue = barPrevious.reduce((s, d) => s + d.revenue, 0);
  const curOrders = barCurrent.reduce((s, d) => s + d.orders, 0);
  const prevOrders = barPrevious.reduce((s, d) => s + d.orders, 0);
  const revComp = calcChange(curRevenue, prevRevenue);
  const ordComp = calcChange(curOrders, prevOrders);
  const proComp = calcChange(curRevenue * 0.65, prevRevenue * 0.65);

  // Pie data: revenue by category
  const pieData = useMemo((): PieSlice[] => {
    const byCategory: Record<string, number> = {};
    MOCK_PRODUCT_SALES.forEach((p) => {
      byCategory[p.category] = (byCategory[p.category] ?? 0) + p.revenue;
    });
    return Object.entries(byCategory)
      .map(([catId, rev], i) => ({
        label: MENU_CATEGORIES.find((c) => c.id === catId)?.name ?? catId,
        value: rev,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, []);

  // Top 5 products
  const top5 = useMemo(
    () => [...filteredSales].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    [filteredSales],
  );

  // Totals for summary row
  const filteredRevenue = filteredSales.reduce((s, d) => s + d.revenue, 0);
  const filteredProfit = filteredSales.reduce((s, d) => s + d.profit, 0);
  const filteredUnits = filteredSales.reduce((s, d) => s + d.unitsSold, 0);
  const avgMargin =
    filteredSales.length > 0
      ? filteredSales.reduce((s, d) => s + d.profitMargin, 0) /
        filteredSales.length
      : 0;

  return (
    <div className="bg-background min-h-screen">
      {/* ── Page Header ── */}
      <header className="sticky top-0 z-30 border-b border-(--color-border-light) bg-(--color-bg-header) shadow-sm">
        <div className="mx-auto flex max-w-screen-2xl items-center gap-4 px-4 py-3">
          <Link
            href="/manager"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-(--color-text-muted) transition-colors hover:bg-(--color-accent-light) hover:text-(--color-primary)"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-accent-light) text-(--color-primary)">
              <i className="fa-solid fa-chart-line"></i>
            </span>
            <div>
              <h1 className="text-foreground text-lg leading-tight font-bold">
                Thống kê & Phân tích tài chính
              </h1>
              <p className="text-xs text-(--color-text-muted)">
                Financial Analytics Dashboard
              </p>
            </div>
          </div>

          {/* Period selector */}
          <div className="ml-auto flex items-center gap-2">
            {(Object.keys(PERIOD_LABELS) as AnalyticsPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`hidden rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:block ${
                  period === p
                    ? "bg-(--color-primary) text-white"
                    : "bg-background text-(--color-text-muted) hover:bg-(--color-accent-light)"
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
            <select
              title="Chọn kỳ"
              value={period}
              onChange={(e) => setPeriod(e.target.value as AnalyticsPeriod)}
              className="text-foreground block rounded-lg border border-(--color-border) bg-(--color-bg-card) px-2 py-1.5 text-xs sm:hidden"
            >
              {(
                Object.entries(PERIOD_LABELS) as [AnalyticsPeriod, string][]
              ).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl space-y-6 p-4 pb-10">
        {/* ── Summary Cards ── */}
        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-wider text-(--color-text-muted) uppercase">
            Tổng quan
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon="fa-solid fa-sack-dollar"
              title="Tổng doanh thu"
              value={formatCurrency(totalRevenue)}
              subtitle={PERIOD_LABELS[period]}
              change={revComp.change}
              changePercent={revComp.changePercent}
              isPositive={revComp.isPositive}
            />
            <SummaryCard
              icon="fa-solid fa-receipt"
              title="Số đơn hàng"
              value={totalOrders.toLocaleString()}
              subtitle="Tổng đơn trong kỳ"
              change={ordComp.change}
              changePercent={ordComp.changePercent}
              isPositive={ordComp.isPositive}
            />
            <SummaryCard
              icon="fa-solid fa-circle-dollar-to-slot"
              title="Tổng lợi nhuận"
              value={formatCurrency(totalProfit)}
              subtitle="Ước tính từ dữ liệu bán hàng"
              change={proComp.change}
              changePercent={proComp.changePercent}
              isPositive={proComp.isPositive}
            />
            <SummaryCard
              icon="fa-solid fa-basket-shopping"
              title="Giá trị đơn TB"
              value={formatCurrency(avgOrderValue)}
              subtitle="Doanh thu / số đơn hàng"
              change={0}
              changePercent={0}
              isPositive={true}
            />
          </div>
        </section>

        {/* ── Revenue Chart ── */}
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
                  <span className="hidden sm:inline">
                    {CHART_META[t].label}
                  </span>
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
              <BarChart
                current={barCurrent}
                previous={barPrevious}
                height={220}
              />
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

        {/* ── Top 5 Products ── */}
        <section className="rounded-2xl border border-(--color-border-light) bg-(--color-bg-card) p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-foreground text-base font-semibold">
              <i className="fa-solid fa-fire mr-2 text-orange-500"></i>
              Top sản phẩm bán chạy
            </h2>
            <CategorySelect
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
          </div>
          <div className="space-y-3">
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

        {/* ── Full Product Table ── */}
        <section className="rounded-2xl border border-(--color-border-light) bg-(--color-bg-card) p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-foreground text-base font-semibold">
              <i className="fa-solid fa-table text-foreground mr-2"></i>
              Phân tích chi tiết sản phẩm
            </h2>
            <CategorySelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              label="Lọc danh mục:"
            />
          </div>
          <p className="mb-3 text-xs text-(--color-text-muted)">
            Click vào tiêu đề cột để sắp xếp. Hiển thị {filteredSales.length}{" "}
            sản phẩm.
          </p>
          <ProductTable data={filteredSales} />

          {/* Summary row */}
          <div className="bg-background mt-4 flex flex-wrap gap-4 rounded-xl p-4 text-sm">
            <div>
              <span className="text-(--color-text-muted)">
                Tổng doanh thu:{" "}
              </span>
              <span className="font-semibold text-(--color-primary)">
                {formatCurrencyFull(filteredRevenue)}
              </span>
            </div>
            <div>
              <span className="text-(--color-text-muted)">
                Tổng lợi nhuận:{" "}
              </span>
              <span className="font-semibold text-green-600">
                {formatCurrencyFull(filteredProfit)}
              </span>
            </div>
            <div>
              <span className="text-(--color-text-muted)">
                Tổng sản lượng:{" "}
              </span>
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
      </main>
    </div>
  );
}
