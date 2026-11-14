// RP-1 → RP-4 in docs/05-api.md. Revenue figures come from static mock series;
// labour cost is computed from the mock shifts.
import {
  MOCK_PRODUCT_SALES,
  MOCK_REVENUE_DAILY,
  MOCK_REVENUE_MONTHLY,
  MOCK_REVENUE_WEEKLY,
  MOCK_REVENUE_YEARLY,
} from "../mock-data/analytics";
import { clone, db, delay, requireShopStaff } from "../mock-data/db";
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

const SERIES: Record<AnalyticsPeriod, RevenueDataPoint[]> = {
  day: MOCK_REVENUE_DAILY,
  week: MOCK_REVENUE_WEEKLY,
  month: MOCK_REVENUE_MONTHLY,
  year: MOCK_REVENUE_YEARLY,
};

/** BR-52: assignments that are paid */
const PAID_STATUSES: AssignmentStatus[] = [
  "REGISTERED",
  "LEAVE_REQUESTED",
  "ATTENDED",
];

/** The mock series holds two periods back to back: previous, then current. */
function halves(period: AnalyticsPeriod) {
  const series = SERIES[period];
  const half = Math.floor(series.length / 2);
  const currentHalf = series.slice(half);
  const previousHalf = series.slice(0, half).slice(0, currentHalf.length);
  return { series, currentHalf, previousHalf };
}

const sum = (points: RevenueDataPoint[], key: "revenue" | "orders") =>
  points.reduce((s, p) => s + p[key], 0);

/** BR-53: no percentage when the previous period is 0 */
function compare(current: number, previous: number): MetricComparison {
  return {
    current,
    previous,
    changePercent:
      previous === 0 ? null : ((current - previous) / previous) * 100,
  };
}

/** Gross margin of the sold lines, used to derive profit from revenue (BR-51). */
function marginRatio() {
  const revenue = MOCK_PRODUCT_SALES.reduce((s, p) => s + p.revenue, 0);
  const profit = MOCK_PRODUCT_SALES.reduce((s, p) => s + p.profit, 0);
  return revenue ? profit / revenue : 0;
}

export const analyticsService = {
  /** RP-1 — BR-50, BR-51, BR-53 */
  async getSummary(
    shopId: number,
    period: AnalyticsPeriod,
  ): Promise<ReportSummary> {
    await delay();
    requireShopStaff(shopId, ["MANAGER"]);
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

  /** RP-2 */
  async getRevenue(
    shopId: number,
    period: AnalyticsPeriod,
  ): Promise<RevenueReport> {
    await delay();
    requireShopStaff(shopId, ["MANAGER"]);
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

  /** RP-3 */
  async getProductSales(
    shopId: number,
    categoryId?: number,
  ): Promise<ProductSalesStats[]> {
    await delay();
    requireShopStaff(shopId, ["MANAGER"]);
    return clone(
      MOCK_PRODUCT_SALES.filter(
        (p) => !categoryId || p.categoryId === categoryId,
      ),
    );
  },

  /** RP-4 — BR-52 */
  async getLaborCost(
    shopId: number,
    weekStart: Date,
  ): Promise<LaborCostReport> {
    await delay(60);
    requireShopStaff(shopId, ["MANAGER"]);
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return formatDateISO(d);
    });
    const byDepartment = new Map<number, number>();
    for (const s of db.shifts) {
      if (s.shopId !== shopId || s.status !== "OPEN" || !dates.includes(s.date))
        continue;
      const paid = db.assignments.filter(
        (a) => a.shiftId === s.id && PAID_STATUSES.includes(a.status),
      ).length;
      byDepartment.set(
        s.departmentId,
        (byDepartment.get(s.departmentId) ?? 0) + s.wage * paid,
      );
    }
    const rows = db.departments
      .filter((d) => d.shopId === shopId)
      .map((d) => ({
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
