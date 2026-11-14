"use client";

import type { AnalyticsPeriod } from "@/lib/types";
import Link from "next/link";

import { PERIOD_LABELS } from "./constants";

export interface AnalyticsHeaderProps {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
}

/** Sticky page header: back link, title and period selector. */
export function AnalyticsHeader({
  period,
  onPeriodChange,
}: AnalyticsHeaderProps) {
  return (
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
              onClick={() => onPeriodChange(p)}
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
            onChange={(e) => onPeriodChange(e.target.value as AnalyticsPeriod)}
            className="text-foreground block rounded-lg border border-(--color-border) bg-(--color-bg-card) px-2 py-1.5 text-xs sm:hidden"
          >
            {(Object.entries(PERIOD_LABELS) as [AnalyticsPeriod, string][]).map(
              ([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ),
            )}
          </select>
        </div>
      </div>
    </header>
  );
}
