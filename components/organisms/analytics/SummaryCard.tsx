import { formatCurrency } from "@/lib/analytics-utils";

export interface SummaryCardProps {
  icon: string;
  title: string;
  value: string;
  change: number;
  changePercent: number;
  isPositive: boolean;
  subtitle?: string;
}

/**
 * Summary metric card with period-over-period comparison indicator.
 * Used in the Financial Analytics dashboard header row.
 */
export function SummaryCard({
  icon,
  title,
  value,
  change,
  changePercent,
  isPositive,
  subtitle,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-(--color-border-light) bg-(--color-bg-card) p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-accent-light) text-lg text-(--color-primary)">
          <i className={icon}></i>
        </span>
        <span className="text-sm font-medium text-(--color-text-muted)">
          {title}
        </span>
      </div>
      <p className="text-foreground text-2xl font-bold tabular-nums">{value}</p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-(--color-text-muted)">{subtitle}</p>
      )}
      <div
        className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${
          isPositive ? "text-green-600" : "text-red-500"
        }`}
      >
        <i
          className={`fa-solid text-xs ${
            isPositive ? "fa-arrow-trend-up" : "fa-arrow-trend-down"
          }`}
        ></i>
        <span>
          {isPositive ? "+" : ""}
          {changePercent.toFixed(1)}%
        </span>
        <span className="text-xs font-normal text-(--color-text-muted)">
          ({isPositive ? "+" : ""}
          {formatCurrency(change)}) so với kỳ trước
        </span>
      </div>
    </div>
  );
}
