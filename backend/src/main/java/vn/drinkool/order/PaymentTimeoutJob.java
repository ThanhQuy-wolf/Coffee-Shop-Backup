package vn.drinkool.order;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * BR-28: huỷ đơn {@code PENDING_PAYMENT} quá P-06 phút. Câu UPDATE có điều kiện nên chạy lại hay chạy
 * trên hai máy cùng lúc cũng không huỷ trùng. Đơn nhân viên vừa xác nhận thì Postgres khoá dòng, UPDATE
 * đọc lại thấy {@code PAID} và bỏ qua.
 */
@Component
public class PaymentTimeoutJob {

    public static final String REASON = "PAYMENT_TIMEOUT";

    private static final Logger log = LoggerFactory.getLogger(PaymentTimeoutJob.class);

    private final JdbcClient jdbc;
    private final Clock clock;

    PaymentTimeoutJob(JdbcClient jdbc, Clock clock) {
        this.jdbc = jdbc;
        this.clock = clock;
    }

    /** @return số đơn vừa huỷ */
    @Transactional
    public int cancelExpired() {
        OffsetDateTime now = OffsetDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
        List<Long> ids = jdbc.sql("""
                        UPDATE customer_order
                        SET status = 'CANCELLED', cancel_reason = :reason, cancelled_at = :now, version = version + 1
                        WHERE status = 'PENDING_PAYMENT'
                          AND created_at < :now - make_interval(mins =>
                                (SELECT payment_timeout_minutes FROM shop_info ORDER BY id LIMIT 1))
                        RETURNING id""")
                .param("reason", REASON)
                .param("now", now)
                .query(Long.class)
                .list();
        if (!ids.isEmpty()) {
            jdbc.sql("UPDATE payment SET status = 'VOIDED' WHERE order_id IN (:ids) AND status = 'PENDING'")
                    .param("ids", ids)
                    .update();
            log.info("BR-28: huỷ {} đơn quá hạn thanh toán: {}", ids.size(), ids);
        }
        return ids.size();
    }

    /** Tắt bằng {@code drinkool.jobs.enabled=false}, test gọi thẳng {@link #cancelExpired()}. */
    @Configuration
    @EnableScheduling
    @ConditionalOnProperty(name = "drinkool.jobs.enabled", havingValue = "true", matchIfMissing = true)
    static class Schedule {

        private final PaymentTimeoutJob job;

        Schedule(PaymentTimeoutJob job) {
            this.job = job;
        }

        @Scheduled(fixedDelayString = "${drinkool.jobs.payment-timeout-interval:60s}",
                initialDelayString = "${drinkool.jobs.payment-timeout-interval:60s}")
        void run() {
            job.cancelExpired();
        }
    }
}
