package vn.drinkool.report;

import java.time.LocalDate;
import java.util.List;

/** Kiểu của RP-1 → RP-4, trùng lib/types.ts của frontend. */
public final class ReportDtos {

    private ReportDtos() {
    }

    /** {@code changePercent} null khi kỳ trước bằng 0 (BR-53). */
    public record MetricComparison(double current, double previous, Double changePercent) {

        static MetricComparison of(double current, double previous) {
            return new MetricComparison(current, previous,
                    previous == 0 ? null : (current - previous) / previous * 100);
        }
    }

    public record Summary(MetricComparison revenue, MetricComparison orders, MetricComparison grossProfit,
                          double averageOrderValue) {
    }

    public record RevenuePoint(String label, long revenue, long orders) {
    }

    /** {@code categoryId} null là các dòng combo (BR-51). */
    public record CategoryRevenue(Long categoryId, String name, long revenue) {
    }

    public record RevenueReport(List<RevenuePoint> series, List<RevenuePoint> currentHalf,
                                List<RevenuePoint> previousHalf, List<CategoryRevenue> byCategory) {
    }

    public record ProductSales(Long productId, String name, Long categoryId, long unitsSold, long revenue,
                               long costPrice, long sellingPrice, long profit, double profitMargin,
                               boolean missingCost) {
    }

    public record DepartmentCost(Long departmentId, String name, long total) {
    }

    public record LaborCost(LocalDate weekStart, long total, List<DepartmentCost> byDepartment) {
    }
}
