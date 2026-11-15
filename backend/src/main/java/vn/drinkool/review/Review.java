package vn.drinkool.review;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** BR-31: không sửa được sau khi gửi, nên entity không có mutator. */
@Entity
@Table(name = "review")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private Long customerId;
    private short rating;
    private String comment;
    private Instant createdAt;

    protected Review() {
    }

    Review(Long orderId, Long customerId, int rating, String comment, Instant createdAt) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.rating = (short) rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
}
