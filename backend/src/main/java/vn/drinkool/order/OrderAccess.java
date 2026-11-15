package vn.drinkool.order;

import java.util.Objects;

import org.springframework.stereotype.Component;

import vn.drinkool.common.error.ApiException;
import vn.drinkool.common.security.CurrentUser;

/**
 * Ai được xem hoặc huỷ một đơn: nhân viên thấy mọi đơn, khách chỉ thấy đơn của mình,
 * khách vãng lai cần đúng {@code X-Guest-Token}. Sai thì trả 404 để không lộ việc đơn tồn tại.
 */
@Component
class OrderAccess {

    enum Viewer { STAFF, MANAGER, CUSTOMER, GUEST }

    private final OrderRepository orders;

    OrderAccess(OrderRepository orders) {
        this.orders = orders;
    }

    static Viewer viewer() {
        return CurrentUser.role().map(Viewer::valueOf).orElse(Viewer.GUEST);
    }

    CustomerOrder load(Long orderId, String guestToken) {
        CustomerOrder order = orders.findById(orderId).orElseThrow(OrderAccess::notFound);
        boolean allowed = switch (viewer()) {
            case STAFF, MANAGER -> true;
            case CUSTOMER -> Objects.equals(order.getCustomerId(), CurrentUser.requireId());
            case GUEST -> guestToken != null && guestToken.equals(order.getGuestToken());
        };
        if (!allowed) {
            throw notFound();
        }
        return order;
    }

    CustomerOrder loadForStaff(Long orderId) {
        return orders.findById(orderId).orElseThrow(OrderAccess::notFound);
    }

    /** Id khách đang xem, null khi là nhân viên hoặc khách vãng lai. */
    static Long viewerCustomerId() {
        return viewer() == Viewer.CUSTOMER ? CurrentUser.requireId() : null;
    }

    private static ApiException notFound() {
        return ApiException.notFound("Không có đơn này");
    }
}
