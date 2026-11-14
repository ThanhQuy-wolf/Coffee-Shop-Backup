import type { AnalyticsPeriod, ReportSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/analytics";

import { SummaryCard } from "./SummaryCard";
import { PERIOD_LABELS } from "./constants";

export interface SummarySectionProps {
  period: AnalyticsPeriod;
  summary: ReportSummary;
}

/** The 4 KPI cards at the top of the analytics page (RP-1). */
export function SummarySection({ period, summary }: SummarySectionProps) {
  const count = (n: number) => n.toLocaleString("vi-VN");
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold tracking-wider text-(--color-text-muted) uppercase">
        Tổng quan
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon="fa-solid fa-sack-dollar"
          title="Doanh thu"
          value={formatCurrency(summary.revenue.current)}
          subtitle={`${PERIOD_LABELS[period]} · chỉ tính đơn hoàn tất`}
          comparison={summary.revenue}
          formatDelta={formatCurrency}
        />
        <SummaryCard
          icon="fa-solid fa-receipt"
          title="Số đơn hàng"
          value={count(summary.orders.current)}
          subtitle="Đơn hoàn tất trong kỳ"
          comparison={summary.orders}
          formatDelta={count}
        />
        <SummaryCard
          icon="fa-solid fa-circle-dollar-to-slot"
          title="Lợi nhuận gộp"
          value={formatCurrency(summary.grossProfit.current)}
          subtitle="Doanh thu trừ giá vốn lúc bán"
          comparison={summary.grossProfit}
          formatDelta={formatCurrency}
        />
        <SummaryCard
          icon="fa-solid fa-basket-shopping"
          title="Giá trị đơn TB"
          value={formatCurrency(summary.averageOrderValue)}
          subtitle="Doanh thu / số đơn"
        />
      </div>
    </section>
  );
}
