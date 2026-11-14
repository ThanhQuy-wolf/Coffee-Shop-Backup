import type { AnalyticsPeriod, ReportSummary } from "@/lib/types";
import { formatNumber, formatVNDShort } from "@/lib/utils/currency";

import { SummaryCard } from "./SummaryCard";
import { PERIOD_LABELS } from "./constants";

export interface SummarySectionProps {
  period: AnalyticsPeriod;
  summary: ReportSummary;
}

/**
 * The four KPI cards at the top of the analytics page (RP-1).
 * @param props.period Period, used in the "vs previous" text.
 * @param props.summary Figures from `analyticsService.getSummary`.
 */
export function SummarySection({ period, summary }: SummarySectionProps) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold tracking-wider text-(--color-text-muted) uppercase">
        Tổng quan
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon="fa-solid fa-sack-dollar"
          title="Doanh thu"
          value={formatVNDShort(summary.revenue.current)}
          subtitle={`${PERIOD_LABELS[period]} · chỉ tính đơn hoàn tất`}
          comparison={summary.revenue}
          formatDelta={formatVNDShort}
        />
        <SummaryCard
          icon="fa-solid fa-receipt"
          title="Số đơn hàng"
          value={formatNumber(summary.orders.current)}
          subtitle="Đơn hoàn tất trong kỳ"
          comparison={summary.orders}
          formatDelta={formatNumber}
        />
        <SummaryCard
          icon="fa-solid fa-circle-dollar-to-slot"
          title="Lợi nhuận gộp"
          value={formatVNDShort(summary.grossProfit.current)}
          subtitle="Doanh thu trừ giá vốn lúc bán"
          comparison={summary.grossProfit}
          formatDelta={formatVNDShort}
        />
        <SummaryCard
          icon="fa-solid fa-basket-shopping"
          title="Giá trị đơn TB"
          value={formatVNDShort(summary.averageOrderValue)}
          subtitle="Doanh thu / số đơn"
        />
      </div>
    </section>
  );
}
