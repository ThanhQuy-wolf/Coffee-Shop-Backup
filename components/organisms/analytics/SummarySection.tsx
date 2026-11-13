import type { AnalyticsPeriod } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/analytics";

import { SummaryCard } from "./SummaryCard";
import { PERIOD_LABELS } from "./constants";

type Change = { change: number; changePercent: number; isPositive: boolean };

export interface SummarySectionProps {
  period: AnalyticsPeriod;
  totalRevenue: number;
  totalOrders: number;
  totalProfit: number;
  avgOrderValue: number;
  revComp: Change;
  ordComp: Change;
  proComp: Change;
}

/** The 4 KPI cards at the top of the analytics page. */
export function SummarySection({
  period,
  totalRevenue,
  totalOrders,
  totalProfit,
  avgOrderValue,
  revComp,
  ordComp,
  proComp,
}: SummarySectionProps) {
  return (
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
  );
}
