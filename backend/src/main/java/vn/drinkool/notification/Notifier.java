package vn.drinkool.notification;

import java.time.Clock;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Ghi thông báo trong ứng dụng (BR-42, BR-48). Người nhận thấy ở A-8 lần đăng nhập tới. */
@Component
public class Notifier {

    private final NotificationRepository repo;
    private final Clock clock;

    public Notifier(NotificationRepository repo, Clock clock) {
        this.repo = repo;
        this.clock = clock;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void send(Long userId, String type, String message, Map<String, Object> extra) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("message", message);
        payload.putAll(extra);
        repo.save(new Notification(userId, type, payload, clock.instant()));
    }
}
