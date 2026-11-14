import type { MetricComparison } from "@/lib/types";

export interface SummaryCardProps {
  icon: string;
  title: string;
  value: string;
  subtitle?: string;
  /** Omit for metrics that are not compared with the previous period. */
  comparison?: MetricComparison;
  /** Formats the absolute change, `String` by default. */
  formatDelta?: (n: number) => string;
}

/**
 * KPI card with the change against the previous period (RP-1).
 * @param props.icon FontAwesome classes for the icon.
 * @param props.title Metric name.
 * @param props.value Formatted value of the current period.
 * @param props.subtitle Line under the value, used when there is no comparison.
 * @param props.comparison Current and previous values; omit to hide the change.
 * @param props.formatDelta Formats the absolute change.
 */
export function SummaryCard({
  icon,
  title,
  value,
  subtitle,
  comparison,
  formatDelta = String,
}: SummaryCardProps) {
  const delta = comparison ? comparison.current - comparison.previous : 0;
  const up = delta >= 0;

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
      {comparison &&
        (comparison.changePercent === null ? (
          // BR-53: previous period was 0, a percentage would be meaningless
          <p className="mt-3 text-sm text-(--color-text-muted)">
            — Kỳ trước chưa có dữ liệu
          </p>
        ) : (
          <div
            className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${up ? "text-green-600" : "text-red-500"}`}
          >
            <i
              className={`fa-solid text-xs ${up ? "fa-arrow-trend-up" : "fa-arrow-trend-down"}`}
            ></i>
            <span>
              {up ? "+" : ""}
              {comparison.changePercent.toFixed(1)}%
            </span>
            <span className="text-xs font-normal text-(--color-text-muted)">
              ({up ? "+" : ""}
              {formatDelta(delta)}) so với kỳ trước
            </span>
          </div>
        ))}
    </div>
  );
}
