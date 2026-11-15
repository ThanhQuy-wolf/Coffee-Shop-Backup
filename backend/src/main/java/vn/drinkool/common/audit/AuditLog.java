package vn.drinkool.common.audit;

import java.time.Instant;
import java.util.Map;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** NFR-03: chỉ INSERT, không sửa không xoá, nên entity không có setter. */
@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long actorId;
    private String action;
    private String entityType;
    private Long entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> beforeData;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> afterData;

    private Instant createdAt;

    protected AuditLog() {
    }

    AuditLog(Long actorId, String action, String entityType, Long entityId, Map<String, Object> beforeData,
             Map<String, Object> afterData, Instant createdAt) {
        this.actorId = actorId;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.beforeData = beforeData;
        this.afterData = afterData;
        this.createdAt = createdAt;
    }

    public String getAction() { return action; }
    public String getEntityType() { return entityType; }
    public Long getEntityId() { return entityId; }
    public Map<String, Object> getBeforeData() { return beforeData; }
    public Map<String, Object> getAfterData() { return afterData; }
}
