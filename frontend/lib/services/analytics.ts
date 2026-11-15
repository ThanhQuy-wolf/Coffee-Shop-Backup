// RP-1 → RP-4 in docs/05-api.md. Every report covers the period that
// contains today and compares it with the period before (BR-53).
import type {
  AnalyticsPeriod,
  LaborCostReport,
  ProductSalesStats,
  ReportSummary,
  RevenueReport,
} from "../types";
import { formatDateISO } from "../utils/date";
import { apiRequest, query } from "./client";

export const analyticsService = {
  /**
   * RP-1: headline figures for the period against the previous one: revenue,
   * order count, gross profit and average order value (BR-50, BR-51, BR-53).
   *
   * @param period - reporting period
   * @returns the summary
   * @throws {ApiError} 401/403 when the caller is not the manager
   */
  getSummary(period: AnalyticsPeriod): Promise<ReportSummary> {
    return apiRequest<ReportSummary>(
      "GET",
      `/v1/reports/summary${query({ period })}`,
    );
  },

  /**
   * RP-2: revenue over time plus revenue by category. Buckets are hours for
   * `day`, days for `week` and `month`, months for `year`.
   *
   * @param period - reporting period
   * @returns the series (previous period, then current), its two halves
   *   aligned by index, and the category breakdown
   * @throws {ApiError} 401/403 when the caller is not the manager
   */
  getRevenue(period: AnalyticsPeriod): Promise<RevenueReport> {
    return apiRequest<RevenueReport>(
      "GET",
      `/v1/reports/revenue${query({ period })}`,
    );
  },

  /**
   * RP-3: units sold, revenue and profit per product in the period. Combo
   * lines are not split into products.
   *
   * @param categoryId - only this category; all when omitted
   * @param period - reporting period, `month` by default
   * @returns one row per product, highest revenue first
   * @throws {ApiError} 401/403 when the caller is not the manager
   */
  getProductSales(
    categoryId?: number,
    period: AnalyticsPeriod = "month",
  ): Promise<ProductSalesStats[]> {
    return apiRequest<ProductSalesStats[]>(
      "GET",
      `/v1/reports/product-sales${query({ period, categoryId })}`,
    );
  },

  /**
   * RP-4: wage cost of one week by department. Counts every paid assignment
   * of open shifts, so before attendance is taken it is a forecast (BR-52).
   *
   * @param weekStart - any day of the week; the backend moves it to Monday
   * @returns the week's total and the total per department
   * @throws {ApiError} 401/403 when the caller is not the manager
   */
  getLaborCost(weekStart: Date): Promise<LaborCostReport> {
    return apiRequest<LaborCostReport>(
      "GET",
      `/v1/reports/labor-cost${query({ weekStart: formatDateISO(weekStart) })}`,
    );
  },
};
