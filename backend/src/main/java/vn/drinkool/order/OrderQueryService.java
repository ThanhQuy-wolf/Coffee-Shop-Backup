package vn.drinkool.order;

import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.common.config.ClockConfig;
import vn.drinkool.common.error.ApiException;
import vn.drinkool.common.security.CurrentUser;
import vn.drinkool.order.OrderDtos.OrderDto;
import vn.drinkool.review.ReviewDto;
import vn.drinkool.review.ReviewQueries;

@Service
@Transactional(readOnly = true)
public class OrderQueryService {

    /** O-2 kèm ETag để màn hình khách gọi lại mỗi P-07 giây mà không phải tải lại cả đơn (FR-14). */
    public record Tagged(OrderDto order, String etag) {
    }

    private static final int HISTORY_LIMIT = 50;

    private final OrderRepository orders;
    private final OrderAccess access;
    private final OrderViews views;
    private final ReviewQueries reviews;
    private final Clock clock;

    OrderQueryService(OrderRepository orders, OrderAccess access, OrderViews views, ReviewQueries reviews,
                      Clock clock) {
        this.orders = orders;
        this.access = access;
        this.views = views;
        this.reviews = reviews;
        this.clock = clock;
    }

    /** O-2. Trả rỗng khi {@code ifNoneMatch} trùng ETag hiện tại, để controller trả 304. */
    public Optional<Tagged> get(Long orderId, String guestToken, String ifNoneMatch) {
        CustomerOrder order = access.load(orderId, guestToken);
        Long reviewId = reviews.byOrderIds(List.of(orderId)).values().stream()
                .map(ReviewDto::id).findFirst().orElse(0L);
        String etag = "\"" + order.getVersion() + "-" + reviewId + "\"";
        if (etag.equals(ifNoneMatch)) {
            return Optional.empty();
        }
        return Optional.of(new Tagged(views.one(order, OrderAccess.viewerCustomerId()), etag));
    }

    /** O-3 */
    public List<OrderDto> mine() {
        long me = CurrentUser.requireId();
        return views.many(orders.findByCustomerIdOrderByCreatedAtDescIdDesc(me, PageRequest.of(0, HISTORY_LIMIT)),
                me);
    }

    /** O-4: cũ nhất trước, đơn chờ lâu nằm đầu hàng. */
    public List<OrderDto> queue(String status, String q, String date) {
        LocalDate day = parseDate(date);
        var from = day.atStartOfDay(ClockConfig.SHOP_ZONE).toInstant();
        var to = day.plusDays(1).atStartOfDay(ClockConfig.SHOP_ZONE).toInstant();
        String code = q == null ? "" : q.strip().toUpperCase();
        return views.many(orders.queue(from, to, parseStatuses(status), code), null);
    }

    /** Version hiện tại để báo kèm lỗi BR-27 khi thua cuộc đua ghi. */
    public Integer currentVersion(Long orderId) {
        return orders.findById(orderId).map(CustomerOrder::getVersion).orElse(null);
    }

    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank()) {
            return LocalDate.now(clock.withZone(ClockConfig.SHOP_ZONE));
        }
        try {
            return LocalDate.parse(date.strip());
        } catch (DateTimeParseException e) {
            throw ApiException.validation("date phải có dạng YYYY-MM-DD");
        }
    }

    private static Set<OrderStatus> parseStatuses(String status) {
        if (status == null || status.isBlank()) {
            return EnumSet.allOf(OrderStatus.class);
        }
        try {
            Set<OrderStatus> set = EnumSet.noneOf(OrderStatus.class);
            Arrays.stream(status.split(",")).map(String::strip).filter(s -> !s.isEmpty())
                    .map(OrderStatus::valueOf).forEach(set::add);
            return set.isEmpty() ? EnumSet.allOf(OrderStatus.class) : set;
        } catch (IllegalArgumentException e) {
            throw ApiException.validation("status không hợp lệ: " + status);
        }
    }
}
