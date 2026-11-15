package vn.drinkool.order;

import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.common.config.ClockConfig;

/** BR-25: DH-YYMMDD-NNNN, số thứ tự đếm lại từ 1 mỗi ngày theo giờ quán. */
@Component
class OrderCodeGenerator {

    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("yyMMdd");

    private final JdbcClient jdbc;
    private final Clock clock;

    OrderCodeGenerator(JdbcClient jdbc, Clock clock) {
        this.jdbc = jdbc;
        this.clock = clock;
    }

    /**
     * Upsert khoá dòng của ngày đến hết transaction, nên hai đơn đặt cùng lúc nhận hai số khác nhau.
     * Đơn bị rollback để lại lỗ trong dãy số, chấp nhận được vì số chỉ để gọi khách.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    String next() {
        LocalDate today = LocalDate.now(clock.withZone(ClockConfig.SHOP_ZONE));
        Integer seq = jdbc.sql("""
                        INSERT INTO order_daily_counter (business_date, last_seq) VALUES (:day, 1)
                        ON CONFLICT (business_date) DO UPDATE SET last_seq = order_daily_counter.last_seq + 1
                        RETURNING last_seq""")
                .param("day", today)
                .query(Integer.class)
                .single();
        return "DH-%s-%04d".formatted(today.format(DAY), seq);
    }
}
