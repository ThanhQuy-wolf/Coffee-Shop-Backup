package vn.drinkool.common.audit;

import java.time.Clock;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.common.security.CurrentUser;

@Service
public class AuditService {

    public static final String PRICE_CHANGED = "PRICE_CHANGED";
    public static final String PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED";
    public static final String ORDER_REFUNDED = "ORDER_REFUNDED";

    private final AuditLogRepository repo;
    private final Clock clock;

    public AuditService(AuditLogRepository repo, Clock clock) {
        this.repo = repo;
        this.clock = clock;
    }

    /** BR-15, BR-17: chỉ ghi khi có ít nhất một giá thực sự đổi. */
    @Transactional(propagation = Propagation.MANDATORY)
    public void priceChanged(String entityType, Long entityId, Map<String, Object> before, Map<String, Object> after) {
        if (Objects.equals(before, after)) {
            return;
        }
        record(PRICE_CHANGED, entityType, entityId, before, after);
    }

    /** NFR-03: thao tác liên quan tới tiền và chấm công. */
    @Transactional(propagation = Propagation.MANDATORY)
    public void record(String action, String entityType, Long entityId, Map<String, Object> before,
                       Map<String, Object> after) {
        repo.save(new AuditLog(CurrentUser.id().orElse(null), action, entityType, entityId, before, after,
                clock.instant()));
    }
}
