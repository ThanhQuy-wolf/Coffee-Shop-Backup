package vn.drinkool.review;

import java.time.OffsetDateTime;

/** Kiểu {@code Review} của R-1, R-2 và trường {@code review} trong đơn (R-48). */
public record ReviewDto(Long id, Long orderId, String orderCode, String customerName, int rating, String comment,
                        OffsetDateTime createdAt) {
}
