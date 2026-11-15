package vn.drinkool.review;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.common.error.ApiException;
import vn.drinkool.common.error.BusinessRuleException;
import vn.drinkool.common.security.CurrentUser;
import vn.drinkool.order.CustomerOrder;
import vn.drinkool.order.OrderRepository;
import vn.drinkool.order.OrderStatus;
import vn.drinkool.shop.ShopService;

@Service
public class ReviewService {

    static final int COMMENT_MAX = 500;
    static final int MAX_PAGE_SIZE = 100;

    public record CreateReviewRequest(Integer rating, String comment) {
    }

    public record ReviewList(List<ReviewDto> items, int page, int size, long total, double average,
                             Map<Integer, Long> countByRating) {
    }

    private final ReviewRepository reviews;
    private final ReviewQueries queries;
    private final OrderRepository orders;
    private final ShopService shop;
    private final Clock clock;

    ReviewService(ReviewRepository reviews, ReviewQueries queries, OrderRepository orders, ShopService shop,
                  Clock clock) {
        this.reviews = reviews;
        this.queries = queries;
        this.orders = orders;
        this.shop = shop;
        this.clock = clock;
    }

    /** R-1 */
    @Transactional
    public ReviewDto create(Long orderId, CreateReviewRequest req) {
        long me = CurrentUser.requireId();
        CustomerOrder order = orders.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Không có đơn này"));
        if (order.getCustomerId() == null || order.getCustomerId() != me) {
            throw br30("Bạn chỉ đánh giá được đơn của mình");
        }
        if (order.getStatus() != OrderStatus.COMPLETED || order.getCompletedAt() == null) {
            throw br30("Chỉ đánh giá được đơn đã hoàn tất");
        }
        Instant now = clock.instant().truncatedTo(ChronoUnit.MICROS);
        int days = shop.current().getReviewWindowDays();
        if (now.isAfter(order.getCompletedAt().plus(Duration.ofDays(days)))) {
            throw br30("Đã quá " + days + " ngày kể từ khi hoàn tất đơn");
        }
        if (reviews.existsByOrderId(orderId)) {
            throw br31("Đơn này đã được đánh giá");
        }
        if (req.rating() == null || req.rating() < 1 || req.rating() > 5) {
            throw br31("Số sao từ 1 đến 5");
        }
        String comment = req.comment() == null || req.comment().isBlank() ? null : req.comment().strip();
        if (comment != null && comment.length() > COMMENT_MAX) {
            throw br31("Bình luận tối đa " + COMMENT_MAX + " ký tự");
        }
        try {
            reviews.saveAndFlush(new Review(orderId, me, req.rating(), comment, now));
        } catch (DataIntegrityViolationException e) {
            // Hai lần gửi cùng lúc: unique(order_id) chặn lần sau
            throw br31("Đơn này đã được đánh giá");
        }
        return queries.byOrderIds(List.of(orderId)).get(orderId);
    }

    /** R-2: thống kê tính trên mọi đánh giá, không theo bộ lọc. */
    @Transactional(readOnly = true)
    public ReviewList list(Integer rating, Integer page, Integer size) {
        int p = page == null ? 1 : page;
        int s = size == null ? 20 : size;
        if (p < 1 || s < 1 || s > MAX_PAGE_SIZE) {
            throw ApiException.validation("page ≥ 1, size từ 1 đến " + MAX_PAGE_SIZE);
        }
        if (rating != null && (rating < 1 || rating > 5)) {
            throw ApiException.validation("rating từ 1 đến 5");
        }
        return new ReviewList(queries.page(rating, s, (long) (p - 1) * s), p, s, queries.count(rating),
                queries.average(), queries.countByRating());
    }

    private static BusinessRuleException br30(String title) {
        return new BusinessRuleException(HttpStatus.UNPROCESSABLE_CONTENT, "BR-30", title);
    }

    private static BusinessRuleException br31(String title) {
        return new BusinessRuleException(HttpStatus.UNPROCESSABLE_CONTENT, "BR-31", title);
    }
}
