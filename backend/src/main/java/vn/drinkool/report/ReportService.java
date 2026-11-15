package vn.drinkool.report;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.common.config.ClockConfig;
import vn.drinkool.common.error.ApiException;
import vn.drinkool.report.ReportDtos.CategoryRevenue;
import vn.drinkool.report.ReportDtos.DepartmentCost;
import vn.drinkool.report.ReportDtos.LaborCost;
import vn.drinkool.report.ReportDtos.MetricComparison;
import vn.drinkool.report.ReportDtos.ProductSales;
import vn.drinkool.report.ReportDtos.RevenuePoint;
import vn.drinkool.report.ReportDtos.RevenueReport;
import vn.drinkool.report.ReportDtos.Summary;

/**
 * RP-1 → RP-4. Truy vấn thẳng bằng SQL vì báo cáo chỉ đọc và cần gom nhóm.
 * Mọi mốc thời gian đổi sang giờ quán trong SQL ({@code AT TIME ZONE}), nên "hôm nay" là ngày ở quán.
 */
@Service
@Transactional(readOnly = true)
public class ReportService {

    /** BR-50: đơn đã thu tiền và chưa bị huỷ. */
    static final String REVENUE_ORDERS = """
            o.status IN ('PAID', 'PREPARING', 'READY', 'COMPLETED')
              AND o.paid_at >= :from AND o.paid_at < :to""";

    private final JdbcClient jdbc;
    private final Clock clock;

    ReportService(JdbcClient jdbc, Clock clock) {
        this.jdbc = jdbc;
        this.clock = clock;
    }

    /** RP-1 */
    public Summary summary(String period, String date) {
        ReportPeriod cur = ReportPeriod.of(period, parseDate(date));
        Totals now = totals(cur);
        Totals before = totals(cur.previous());
        return new Summary(MetricComparison.of(now.revenue, before.revenue),
                MetricComparison.of(now.orders, before.orders),
                MetricComparison.of(now.profit, before.profit),
                now.orders == 0 ? 0 : (double) now.revenue / now.orders);
    }

    /** RP-2: {@code series} là kỳ trước nối với kỳ này. */
    public RevenueReport revenue(String period, String date) {
        ReportPeriod cur = ReportPeriod.of(period, parseDate(date));
        ReportPeriod prev = cur.previous();
        Map<LocalDateTime, long[]> byBucket = new HashMap<>();
        jdbc.sql("""
                        SELECT date_trunc(:unit, o.paid_at AT TIME ZONE :zone) AS bucket,
                               sum(o.total) AS revenue, count(*) AS orders
                        FROM customer_order o
                        WHERE %s
                        GROUP BY 1""".formatted(REVENUE_ORDERS))
                .param("unit", cur.kind().sqlUnit)
                .param("zone", ClockConfig.SHOP_ZONE.getId())
                .param("from", instant(prev.from()))
                .param("to", instant(cur.to()))
                .query((rs, n) -> byBucket.put(rs.getObject("bucket", Timestamp.class).toLocalDateTime(),
                        new long[] {rs.getLong("revenue"), rs.getLong("orders")}))
                .list();
        List<RevenuePoint> current = points(cur, cur.buckets(), byBucket);
        // Hai kỳ ghép theo vị trí; tháng trước ngắn hơn thì phần thiếu là 0 với nhãn rỗng (R-56)
        List<LocalDateTime> prevBuckets = prev.buckets();
        List<RevenuePoint> previous = new ArrayList<>();
        for (int i = 0; i < current.size(); i++) {
            previous.add(i < prevBuckets.size()
                    ? points(prev, List.of(prevBuckets.get(i)), byBucket).getFirst()
                    : new RevenuePoint("", 0, 0));
        }
        List<RevenuePoint> series = new ArrayList<>(previous);
        series.addAll(current);
        List<CategoryRevenue> byCategory = jdbc.sql("""
                        SELECT i.category_id_snapshot AS category_id, c.name, sum(i.line_total) AS revenue
                        FROM order_item i
                        JOIN customer_order o ON o.id = i.order_id
                        LEFT JOIN category c ON c.id = i.category_id_snapshot
                        WHERE %s
                        GROUP BY i.category_id_snapshot, c.name
                        ORDER BY revenue DESC""".formatted(REVENUE_ORDERS))
                .param("from", instant(cur.from()))
                .param("to", instant(cur.to()))
                .query((rs, n) -> {
                    Long id = rs.getObject("category_id", Long.class);
                    return new CategoryRevenue(id, id == null ? "Combo" : rs.getString("name"),
                            rs.getLong("revenue"));
                })
                .list();
        return new RevenueReport(series, current, previous, byCategory);
    }

    /** RP-3: dòng món, không gồm dòng combo (R-57). Giá vốn, giá bán là trung bình theo ly đã bán. */
    public List<ProductSales> productSales(String period, String date, Long categoryId) {
        ReportPeriod cur = ReportPeriod.of(period, parseDate(date));
        return jdbc.sql("""
                        SELECT i.product_id, p.name, p.category_id,
                               sum(i.quantity) AS units, sum(i.line_total) AS revenue,
                               sum(i.unit_cost * i.quantity) AS cost,
                               bool_or(i.unit_cost = 0) AS missing_cost
                        FROM order_item i
                        JOIN customer_order o ON o.id = i.order_id
                        JOIN product p ON p.id = i.product_id
                        WHERE i.item_type = 'PRODUCT' AND %s
                          AND (CAST(:categoryId AS bigint) IS NULL OR p.category_id = :categoryId)
                        GROUP BY i.product_id, p.name, p.category_id
                        ORDER BY revenue DESC, i.product_id""".formatted(REVENUE_ORDERS))
                .param("from", instant(cur.from()))
                .param("to", instant(cur.to()))
                .param("categoryId", categoryId, java.sql.Types.BIGINT)
                .query((rs, n) -> {
                    long units = rs.getLong("units");
                    long revenue = rs.getLong("revenue");
                    long cost = rs.getLong("cost");
                    long profit = revenue - cost;
                    return new ProductSales(rs.getLong("product_id"), rs.getString("name"),
                            rs.getLong("category_id"), units, revenue, Math.round((double) cost / units),
                            Math.round((double) revenue / units), profit,
                            revenue == 0 ? 0 : (double) profit / revenue * 100, rs.getBoolean("missing_cost"));
                })
                .list();
    }

    /** RP-4 (BR-52): ca đang mở trong tuần, tính các phân ca được trả lương. */
    public LaborCost laborCost(String weekStart) {
        LocalDate monday = parseDate(weekStart).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<DepartmentCost> rows = jdbc.sql("""
                        SELECT d.id, d.name, coalesce(sum(CASE WHEN a.id IS NOT NULL THEN s.wage END), 0) AS total
                        FROM department d
                        LEFT JOIN shift s ON s.department_id = d.id AND s.status = 'OPEN'
                             AND s.shift_date >= :from AND s.shift_date < :to
                        LEFT JOIN shift_assignment a ON a.shift_id = s.id
                             AND a.status IN ('REGISTERED', 'LEAVE_REQUESTED', 'ATTENDED')
                        GROUP BY d.id, d.name
                        ORDER BY d.id""")
                .param("from", monday)
                .param("to", monday.plusWeeks(1))
                .query((rs, n) -> new DepartmentCost(rs.getLong("id"), rs.getString("name"), rs.getLong("total")))
                .list();
        return new LaborCost(monday, rows.stream().mapToLong(DepartmentCost::total).sum(), rows);
    }

    private record Totals(long revenue, long orders, long profit) {
    }

    /** BR-50, BR-51: lợi nhuận dùng giá vốn đã chụp lúc bán. */
    private Totals totals(ReportPeriod p) {
        return jdbc.sql("""
                        SELECT coalesce(sum(o.total), 0) AS revenue, count(*) AS orders,
                               coalesce(sum((SELECT sum((i.unit_price - i.unit_cost) * i.quantity)
                                             FROM order_item i WHERE i.order_id = o.id)), 0) AS profit
                        FROM customer_order o
                        WHERE %s""".formatted(REVENUE_ORDERS))
                .param("from", instant(p.from()))
                .param("to", instant(p.to()))
                .query((rs, n) -> new Totals(rs.getLong("revenue"), rs.getLong("orders"), rs.getLong("profit")))
                .single();
    }

    private static List<RevenuePoint> points(ReportPeriod p, List<LocalDateTime> buckets,
                                             Map<LocalDateTime, long[]> data) {
        return buckets.stream().map(b -> {
            long[] v = data.getOrDefault(b, new long[2]);
            return new RevenuePoint(p.label(b), v[0], v[1]);
        }).toList();
    }

    private static OffsetDateTime instant(LocalDateTime shopTime) {
        return shopTime.atZone(ClockConfig.SHOP_ZONE).toOffsetDateTime();
    }

    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank()) {
            return LocalDate.now(clock.withZone(ClockConfig.SHOP_ZONE));
        }
        try {
            return LocalDate.parse(date.strip());
        } catch (DateTimeParseException e) {
            throw ApiException.validation("Ngày phải có dạng YYYY-MM-DD");
        }
    }
}
