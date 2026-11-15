package vn.drinkool.notification;

import java.time.Instant;
import java.util.Map;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String type;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> payload;

    private Instant readAt;

    @Column(updatable = false)
    private Instant createdAt;

    protected Notification() {
    }

    /** {@code payload.message} là câu hiển thị sẵn, các khoá khác (shiftId...) để frontend dẫn link. */
    public Notification(Long userId, String type, Map<String, Object> payload, Instant createdAt) {
        this.userId = userId;
        this.type = type;
        this.payload = payload;
        this.createdAt = createdAt;
    }

    public void markRead(Instant now) {
        if (readAt == null) {
            readAt = now;
        }
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getType() { return type; }
    public Map<String, Object> getPayload() { return payload; }
    public Instant getReadAt() { return readAt; }
    public Instant getCreatedAt() { return createdAt; }
}
