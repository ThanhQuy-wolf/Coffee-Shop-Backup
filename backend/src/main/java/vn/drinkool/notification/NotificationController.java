package vn.drinkool.notification;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.drinkool.common.config.Times;
import vn.drinkool.common.security.CurrentUser;

/** A-8, A-9. */
@RestController
@RequestMapping("/api/v1/me/notifications")
public class NotificationController {

    public record NotificationDto(Long id, String type, String message, OffsetDateTime readAt,
                                  OffsetDateTime createdAt) {

        static NotificationDto of(Notification n) {
            Object message = n.getPayload() == null ? null : n.getPayload().get("message");
            return new NotificationDto(n.getId(), n.getType(), message == null ? "" : message.toString(),
                    Times.toShopTime(n.getReadAt()), Times.toShopTime(n.getCreatedAt()));
        }
    }

    private final NotificationRepository notifications;
    private final Clock clock;

    public NotificationController(NotificationRepository notifications, Clock clock) {
        this.notifications = notifications;
        this.clock = clock;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<NotificationDto> unread() {
        return notifications.findByUserIdAndReadAtIsNullOrderByCreatedAtDescIdDesc(CurrentUser.requireId())
                .stream().map(NotificationDto::of).toList();
    }

    // Id của người khác bị bỏ qua thay vì trả 404, để không lộ thông báo có tồn tại.
    @PostMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Void> markRead(@PathVariable long id) {
        notifications.findByIdAndUserId(id, CurrentUser.requireId()).ifPresent(n -> n.markRead(clock.instant()));
        return ResponseEntity.noContent().build();
    }
}
