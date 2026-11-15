package vn.drinkool.review;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

import vn.drinkool.common.config.Times;

/** Đọc đánh giá kèm mã đơn và tên khách. Dùng chung cho R-2 và kiểu {@code Order}. */
@Component
public class ReviewQueries {

    static final String SELECT = """
            SELECT r.id, r.order_id, o.code, u.full_name, r.rating, r.comment, r.created_at
            FROM review r
            JOIN customer_order o ON o.id = r.order_id
            JOIN app_user u ON u.id = r.customer_id
            """;

    private final JdbcClient jdbc;

    ReviewQueries(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public Map<Long, ReviewDto> byOrderIds(Collection<Long> orderIds) {
        if (orderIds.isEmpty()) {
            return Map.of();
        }
        return jdbc.sql(SELECT + "WHERE r.order_id IN (:ids)")
                .param("ids", orderIds)
                .query(ReviewQueries::map)
                .list().stream()
                .collect(Collectors.toMap(ReviewDto::orderId, Function.identity()));
    }

    List<ReviewDto> page(Integer rating, int limit, long offset) {
        return jdbc.sql(SELECT + "WHERE (:rating IS NULL OR r.rating = :rating) "
                        + "ORDER BY r.created_at DESC, r.id DESC LIMIT :limit OFFSET :offset")
                .param("rating", rating, java.sql.Types.INTEGER)
                .param("limit", limit)
                .param("offset", offset)
                .query(ReviewQueries::map)
                .list();
    }

    long count(Integer rating) {
        return jdbc.sql("SELECT count(*) FROM review WHERE (:rating IS NULL OR rating = :rating)")
                .param("rating", rating, java.sql.Types.INTEGER)
                .query(Long.class).single();
    }

    /** Số đánh giá theo từng mức sao, đủ 5 mức kể cả mức chưa có ai chấm. */
    Map<Integer, Long> countByRating() {
        return jdbc.sql("""
                        SELECT g.rating, count(r.id) AS n
                        FROM generate_series(1, 5) AS g(rating)
                        LEFT JOIN review r ON r.rating = g.rating
                        GROUP BY g.rating ORDER BY g.rating""")
                .query((rs, n) -> Map.entry(rs.getInt("rating"), rs.getLong("n")))
                .list().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a,
                        java.util.LinkedHashMap::new));
    }

    double average() {
        // avg() trả NULL khi chưa có đánh giá nào, single() không nhận NULL
        return jdbc.sql("SELECT coalesce(avg(rating), 0)::float8 FROM review").query(Double.class).single();
    }

    private static ReviewDto map(ResultSet rs, int n) throws SQLException {
        return new ReviewDto(rs.getLong("id"), rs.getLong("order_id"), rs.getString("code"),
                rs.getString("full_name"), rs.getInt("rating"), rs.getString("comment"),
                Times.toShopTime(rs.getObject("created_at", Timestamp.class).toInstant()));
    }
}
