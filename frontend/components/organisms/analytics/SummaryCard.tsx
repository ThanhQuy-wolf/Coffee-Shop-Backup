import { Icon } from "@/components/atoms";
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
    <div className="rounded-2xl border border-(--color-border-light) bg-(--color-bg-card) p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2 sm:gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-(--color-accent-light) text-base text-(--color-primary) sm:h-10 sm:w-10 sm:text-lg">
          <Icon name={icon} />
        </span>
        <span className="text-xs font-medium text-(--color-text-muted) sm:text-sm">
          {title}
        </span>
      </div>
      <p className="text-foreground text-xl font-bold tabular-nums sm:text-2xl">
        {value}
      </p>
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
            className={`mt-3 flex flex-wrap items-center gap-x-1.5 text-xs font-medium sm:text-sm ${up ? "text-(--color-success)" : "text-(--color-danger)"}`}
          >
            <Icon
              name={up ? "arrow-trend-up" : "arrow-trend-down"}
              className="text-xs"
            />
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
