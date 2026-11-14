// ─── Analytics service: revenue & product sales ──────────────────────────────
// Mock data for now — swap for API calls when the backend is ready.
import {
  MOCK_PRODUCT_SALES,
  MOCK_REVENUE_DAILY,
  MOCK_REVENUE_MONTHLY,
  MOCK_REVENUE_WEEKLY,
  MOCK_REVENUE_YEARLY,
} from "../mock-data/analytics";
import type {
  AnalyticsPeriod,
  ProductSalesStats,
  RevenueDataPoint,
} from "../types";

const REVENUE_BY_PERIOD: Record<AnalyticsPeriod, RevenueDataPoint[]> = {
  day: MOCK_REVENUE_DAILY,
  week: MOCK_REVENUE_WEEKLY,
  month: MOCK_REVENUE_MONTHLY,
  year: MOCK_REVENUE_YEARLY,
};

export function getRevenue(period: AnalyticsPeriod): RevenueDataPoint[] {
  return REVENUE_BY_PERIOD[period];
}

export function getProductSales(): ProductSalesStats[] {
  return MOCK_PRODUCT_SALES;
}
