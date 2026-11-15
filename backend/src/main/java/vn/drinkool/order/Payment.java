package vn.drinkool.order;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "payment")
public class Payment {

    public enum Status { PENDING, CONFIRMED, VOIDED, REFUNDED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    private Status status;

    private long amount;
    private Long confirmedBy;
    private Instant confirmedAt;
    private Instant refundedAt;

    protected Payment() {
    }

    Payment(Long orderId, PaymentMethod method, long amount) {
        this.orderId = orderId;
        this.method = method;
        this.status = Status.PENDING;
        this.amount = amount;
    }

    void confirm(PaymentMethod method, Long by, Instant now) {
        this.method = method;
        this.status = Status.CONFIRMED;
        this.confirmedBy = by;
        this.confirmedAt = now;
    }

    void voidPayment() {
        status = Status.VOIDED;
    }

    /** BR-29: tiền hoàn ngoài hệ thống, ở đây chỉ ghi nhận. */
    void refund(Instant now) {
        status = Status.REFUNDED;
        refundedAt = now;
    }

    public Long getOrderId() { return orderId; }
    public PaymentMethod getMethod() { return method; }
    public Status getStatus() { return status; }
    public long getAmount() { return amount; }
    public Instant getConfirmedAt() { return confirmedAt; }
}
