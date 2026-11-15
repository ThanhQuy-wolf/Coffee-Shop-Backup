package vn.drinkool.order;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import org.hibernate.annotations.OptimisticLock;

@Entity
@Table(name = "customer_order")
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
    private Long customerId;
    private String guestToken;
    private String tableLabel;
    private String note;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private long total;
    private String idempotencyKey;
    private String requestFingerprint;

    // BR-27: Hibernate tự tăng khi ghi và từ chối lệnh ghi đến sau bằng version cũ.
    @Version
    private Integer version = 1;

    private Instant createdAt;
    private Instant paidAt;
    private Instant completedAt;
    private Instant cancelledAt;
    private String cancelReason;
    private Long cancelledBy;

    // Dòng đơn không đổi sau khi đặt; loại khỏi optimistic lock để lúc tạo đơn version vẫn là 1
    @OptimisticLock(excluded = true)
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id", nullable = false)
    @OrderBy("id")
    private List<OrderItem> items = new ArrayList<>();

    protected CustomerOrder() {
    }

    CustomerOrder(String code, Long customerId, String guestToken, String tableLabel, String note, long total,
                  String idempotencyKey, String requestFingerprint, Instant createdAt, List<OrderItem> items) {
        this.code = code;
        this.customerId = customerId;
        this.guestToken = guestToken;
        this.tableLabel = tableLabel;
        this.note = note;
        this.status = OrderStatus.PENDING_PAYMENT;
        this.total = total;
        this.idempotencyKey = idempotencyKey;
        this.requestFingerprint = requestFingerprint;
        this.createdAt = createdAt;
        this.items.addAll(items);
    }

    void markPaid(Instant now) {
        status = OrderStatus.PAID;
        paidAt = now;
    }

    void moveTo(OrderStatus next, Instant now) {
        status = next;
        if (next == OrderStatus.COMPLETED) {
            completedAt = now;
        }
    }

    void cancel(String reason, Long by, Instant now) {
        status = OrderStatus.CANCELLED;
        cancelReason = reason;
        cancelledBy = by;
        cancelledAt = now;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public Long getCustomerId() { return customerId; }
    public String getGuestToken() { return guestToken; }
    public String getTableLabel() { return tableLabel; }
    public String getNote() { return note; }
    public OrderStatus getStatus() { return status; }
    public long getTotal() { return total; }
    public String getRequestFingerprint() { return requestFingerprint; }
    public int getVersion() { return version; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getPaidAt() { return paidAt; }
    public Instant getCompletedAt() { return completedAt; }
    public Instant getCancelledAt() { return cancelledAt; }
    public String getCancelReason() { return cancelReason; }
    public List<OrderItem> getItems() { return items; }
}
