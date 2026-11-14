// RP-1 → RP-4 in docs/05-api.md. Revenue figures come from static mock series;
// labour cost is computed from the mock shifts.
import {
  MOCK_PRODUCT_SALES,
  MOCK_REVENUE_DAILY,
  MOCK_REVENUE_MONTHLY,
  MOCK_REVENUE_WEEKLY,
  MOCK_REVENUE_YEARLY,
} from "../mock-data/analytics";
import { clone, db, delay, requireActor } from "../mock-data/db";
import type {
  AnalyticsPeriod,
  AssignmentStatus,
  LaborCostReport,
  MetricComparison,
  ProductSalesStats,
  ReportSummary,
  RevenueDataPoint,
  RevenueReport,
} from "../types";
import { formatDateISO } from "../utils/date";

/** Static revenue series for each reporting period. */
const SERIES: Record<AnalyticsPeriod, RevenueDataPoint[]> = {
  day: MOCK_REVENUE_DAILY,
  week: MOCK_REVENUE_WEEKLY,
  month: MOCK_REVENUE_MONTHLY,
  year: MOCK_REVENUE_YEARLY,
};

/** Assignment statuses that are paid a wage (BR-52). */
const PAID_STATUSES: AssignmentStatus[] = [
  "REGISTERED",
  "LEAVE_REQUESTED",
  "ATTENDED",
];

/**
 * Splits a mock series into its two periods. Each series holds the previous
 * period followed by the current one.
 * @param period Reporting period.
 * @returns The full series and its current and previous halves, equal length.
 */
function halves(period: AnalyticsPeriod) {
  const series = SERIES[period];
  const half = Math.floor(series.length / 2);
  const currentHalf = series.slice(half);
  const previousHalf = series.slice(0, half).slice(0, currentHalf.length);
  return { series, currentHalf, previousHalf };
}

/**
 * Totals one field over a set of points.
 * @param points Revenue points.
 * @param key Field to add up.
 */
const sum = (points: RevenueDataPoint[], key: "revenue" | "orders") =>
  points.reduce((s, p) => s + p[key], 0);

/**
 * Builds a current-vs-previous metric. There is no percentage when the
 * previous value is 0 (BR-53).
 * @param current Value in the current period.
 * @param previous Value in the previous period.
 * @returns Both values and `changePercent`, or null for it.
 */
function compare(current: number, previous: number): MetricComparison {
  return {
    current,
    previous,
    changePercent:
      previous === 0 ? null : ((current - previous) / previous) * 100,
  };
}

/**
 * Gross margin of the sold lines, used to derive profit from revenue (BR-51).
 * @returns Profit divided by revenue, or 0 with no sales.
 */
function marginRatio() {
  const revenue = MOCK_PRODUCT_SALES.reduce((s, p) => s + p.revenue, 0);
  const profit = MOCK_PRODUCT_SALES.reduce((s, p) => s + p.profit, 0);
  return revenue ? profit / revenue : 0;
}

export const analyticsService = {
  /**
   * RP-1: headline figures for the period against the previous one: revenue,
   * order count, gross profit and average order value (BR-50, BR-51, BR-53).
   * @param period Reporting period.
   * @returns The summary.
   * @throws {ApiError} 401/403 when the caller is not the manager.
   */
  async getSummary(period: AnalyticsPeriod): Promise<ReportSummary> {
    await delay();
    requireActor(["MANAGER"]);
    const { currentHalf, previousHalf } = halves(period);
    const ratio = marginRatio();
    const revenue = compare(
      sum(currentHalf, "revenue"),
      sum(previousHalf, "revenue"),
    );
    const orders = compare(
      sum(currentHalf, "orders"),
      sum(previousHalf, "orders"),
    );
    return {
      revenue,
      orders,
      grossProfit: compare(
        Math.round(revenue.current * ratio),
        Math.round(revenue.previous * ratio),
      ),
      averageOrderValue: orders.current ? revenue.current / orders.current : 0,
    };
  },

  /**
   * RP-2: revenue over time plus revenue by category.
   * @param period Reporting period.
   * @returns The series, its two halves and the category breakdown.
   * @throws {ApiError} 401/403 when the caller is not the manager.
   */
  async getRevenue(period: AnalyticsPeriod): Promise<RevenueReport> {
    await delay();
    requireActor(["MANAGER"]);
    const byCategory = new Map<number, number>();
    MOCK_PRODUCT_SALES.forEach((p) =>
      byCategory.set(
        p.categoryId,
        (byCategory.get(p.categoryId) ?? 0) + p.revenue,
      ),
    );
    return clone({
      ...halves(period),
      byCategory: [...byCategory.entries()].map(([categoryId, revenue]) => ({
        categoryId,
        name:
          db.categories.find((c) => c.id === categoryId)?.name ??
          `#${categoryId}`,
        revenue,
      })),
    });
  },

  /**
   * RP-3: units sold, revenue and profit per product.
   * @param categoryId Only this category; all when omitted.
   * @returns One row per product.
   * @throws {ApiError} 401/403 when the caller is not the manager.
   */
  async getProductSales(categoryId?: number): Promise<ProductSalesStats[]> {
    await delay();
    requireActor(["MANAGER"]);
    return clone(
      MOCK_PRODUCT_SALES.filter(
        (p) => !categoryId || p.categoryId === categoryId,
      ),
    );
  },

  /**
   * RP-4: wage cost of one week by department. Counts every paid assignment
   * of open shifts, so before attendance is taken it is a forecast (BR-52).
   * @param weekStart Monday of the week.
   * @returns The week's total and the total per department.
   * @throws {ApiError} 401/403 when the caller is not the manager.
   */
  async getLaborCost(weekStart: Date): Promise<LaborCostReport> {
    await delay(60);
    requireActor(["MANAGER"]);
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return formatDateISO(d);
    });
    const byDepartment = new Map<number, number>();
    for (const s of db.shifts) {
      if (s.status !== "OPEN" || !dates.includes(s.date)) continue;
      const paid = db.assignments.filter(
        (a) => a.shiftId === s.id && PAID_STATUSES.includes(a.status),
      ).length;
      byDepartment.set(
        s.departmentId,
        (byDepartment.get(s.departmentId) ?? 0) + s.wage * paid,
      );
    }
    const rows = db.departments.map((d) => ({
      departmentId: d.id,
      name: d.name,
      total: byDepartment.get(d.id) ?? 0,
    }));
    return {
      weekStart: dates[0],
      total: rows.reduce((s, r) => s + r.total, 0),
      byDepartment: rows,
    };
  },
};
