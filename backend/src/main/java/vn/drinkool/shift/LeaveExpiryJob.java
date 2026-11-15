package vn.drinkool.shift;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.common.config.ClockConfig;
import vn.drinkool.notification.Notifier;

/**
 * BR-48: yêu cầu nghỉ chưa được duyệt khi ca đã bắt đầu thì phân ca trở về REGISTERED.
 * Câu UPDATE có điều kiện nên chạy lại không đổi gì và không gửi thông báo lần hai.
 */
@Component
public class LeaveExpiryJob {

    private static final Logger log = LoggerFactory.getLogger(LeaveExpiryJob.class);

    private record Expired(Long staffId, Long shiftId, LocalDate date, LocalTime start) {
    }

    private final JdbcClient jdbc;
    private final Notifier notifier;
    private final Clock clock;

    LeaveExpiryJob(JdbcClient jdbc, Notifier notifier, Clock clock) {
        this.jdbc = jdbc;
        this.notifier = notifier;
        this.clock = clock;
    }

    /** @return số phân ca vừa trả về REGISTERED */
    @Transactional
    public int expire() {
        OffsetDateTime now = OffsetDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
        List<Expired> expired = jdbc.sql("""
                        UPDATE shift_assignment a SET status = 'REGISTERED', updated_at = :now
                        FROM shift s
                        WHERE s.id = a.shift_id AND a.status = 'LEAVE_REQUESTED'
                          AND (s.shift_date + s.start_time) AT TIME ZONE :zone <= :now
                        RETURNING a.staff_id, s.id AS shift_id, s.shift_date, s.start_time""")
                .param("now", now)
                .param("zone", ClockConfig.SHOP_ZONE.getId())
                .query((rs, n) -> new Expired(rs.getLong("staff_id"), rs.getLong("shift_id"),
                        rs.getObject("shift_date", LocalDate.class), rs.getObject("start_time", LocalTime.class)))
                .list();
        for (Expired e : expired) {
            notifier.send(e.staffId(), "LEAVE_EXPIRED", "Yêu cầu nghỉ ca " + e.date() + " "
                    + e.start().format(ShiftViews.HH_MM) + " chưa được duyệt nên bạn vẫn phải đi làm.",
                    Map.of("shiftId", e.shiftId()));
        }
        if (!expired.isEmpty()) {
            log.info("BR-48: {} yêu cầu nghỉ hết hạn", expired.size());
        }
        return expired.size();
    }

    /** Tắt cùng các job khác bằng {@code drinkool.jobs.enabled=false}. */
    @Configuration
    @EnableScheduling
    @ConditionalOnProperty(name = "drinkool.jobs.enabled", havingValue = "true", matchIfMissing = true)
    static class Schedule {

        private final LeaveExpiryJob job;

        Schedule(LeaveExpiryJob job) {
            this.job = job;
        }

        @Scheduled(fixedDelayString = "${drinkool.jobs.leave-expiry-interval:60s}",
                initialDelayString = "${drinkool.jobs.leave-expiry-interval:60s}")
        void run() {
            job.expire();
        }
    }
}
