package vn.drinkool.order;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.common.audit.AuditService;
import vn.drinkool.common.error.BusinessRuleException;
import vn.drinkool.common.security.CurrentUser;
import vn.drinkool.order.OrderAccess.Viewer;
import vn.drinkool.order.OrderDtos.CancelRequest;
import vn.drinkool.order.OrderDtos.ConfirmPaymentRequest;
import vn.drinkool.order.OrderDtos.OrderDto;

/** O-5 → O-9. Mọi lệnh kiểm {@code version} trước tiên (BR-27), rồi mới tới trạng thái. */
@Service
@Transactional
public class OrderWorkflowService {

    private final OrderRepository orders;
    private final PaymentRepository payments;
    private final OrderAccess access;
    private final OrderViews views;
    private final AuditService audit;
    private final Clock clock;

    OrderWorkflowService(OrderRepository orders, PaymentRepository payments, OrderAccess access, OrderViews views,
                         AuditService audit, Clock clock) {
        this.orders = orders;
        this.payments = payments;
        this.access = access;
        this.views = views;
        this.audit = audit;
        this.clock = clock;
    }

    /** O-5 */
    public OrderDto confirmPayment(Long orderId, ConfirmPaymentRequest req) {
        CustomerOrder order = access.loadForStaff(orderId);
        checkVersion(order, req.version());
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new BusinessRuleException(HttpStatus.CONFLICT, "BR-26", "Đơn không còn chờ thanh toán",
                    "Đơn đang ở trạng thái " + order.getStatus())
                    .with("status", order.getStatus().name());
        }
        if (req.amount() != order.getTotal()) {
            throw new BusinessRuleException(HttpStatus.UNPROCESSABLE_CONTENT, "BR-26",
                    "Số tiền xác nhận phải bằng tổng đơn")
                    .with("total", order.getTotal());
        }
        Payment payment = payments.findByOrderId(orderId).orElseThrow();
        Instant now = clock.instant();
        PaymentMethod before = payment.getMethod();
        payment.confirm(req.method(), CurrentUser.requireId(), now);
        order.markPaid(now);
        audit.record(AuditService.PAYMENT_CONFIRMED, "ORDER", orderId,
                Map.of("status", OrderStatus.PENDING_PAYMENT.name(), "method", before.name()),
                Map.of("status", OrderStatus.PAID.name(), "method", req.method().name(), "amount", req.amount()));
        return saved(order);
    }

    /** O-6 */
    public OrderDto start(Long orderId, int version) {
        return move(orderId, version, OrderStatus.PAID, OrderStatus.PREPARING, "bắt đầu pha chế");
    }

    /** O-7 */
    public OrderDto markReady(Long orderId, int version) {
        return move(orderId, version, OrderStatus.PREPARING, OrderStatus.READY, "báo xong");
    }

    /** O-8 */
    public OrderDto complete(Long orderId, int version) {
        return move(orderId, version, OrderStatus.READY, OrderStatus.COMPLETED, "giao cho khách");
    }

    /** O-9, theo bảng "Ai được huỷ đơn" ở docs/05-api.md. */
    public OrderDto cancel(Long orderId, CancelRequest req, String guestToken) {
        CustomerOrder order = access.load(orderId, guestToken);
        checkVersion(order, req.version());
        Viewer viewer = OrderAccess.viewer();
        boolean staffSide = viewer == Viewer.STAFF || viewer == Viewer.MANAGER;
        String reason = req.reason() == null || req.reason().isBlank() ? null : req.reason().strip();
        Payment payment = payments.findByOrderId(orderId).orElseThrow();
        Instant now = clock.instant();
        switch (order.getStatus()) {
            case PENDING_PAYMENT -> {
                payment.voidPayment();
                order.cancel(reason != null ? reason : staffSide ? "Nhân viên huỷ" : "Khách huỷ",
                        CurrentUser.id().orElse(null), now);
            }
            case PAID, PREPARING -> {
                if (viewer != Viewer.MANAGER) {
                    throw new BusinessRuleException(HttpStatus.FORBIDDEN, "BR-29",
                            "Chỉ quản lý được huỷ đơn đã thanh toán");
                }
                if (reason == null) {
                    throw new BusinessRuleException(HttpStatus.UNPROCESSABLE_CONTENT, "BR-29",
                            "Huỷ đơn đã thanh toán phải nhập lý do");
                }
                OrderStatus before = order.getStatus();
                payment.refund(now);
                order.cancel(reason, CurrentUser.requireId(), now);
                audit.record(AuditService.ORDER_REFUNDED, "ORDER", orderId,
                        Map.of("status", before.name(), "paymentStatus", Payment.Status.CONFIRMED.name()),
                        Map.of("status", OrderStatus.CANCELLED.name(), "paymentStatus",
                                Payment.Status.REFUNDED.name(), "amount", payment.getAmount(), "reason", reason));
            }
            default -> throw OrderErrors.wrongState(order.getStatus(), "huỷ");
        }
        return saved(order);
    }

    private OrderDto move(Long orderId, int version, OrderStatus from, OrderStatus to, String action) {
        CustomerOrder order = access.loadForStaff(orderId);
        checkVersion(order, version);
        if (order.getStatus() != from) {
            throw OrderErrors.wrongState(order.getStatus(), action);
        }
        order.moveTo(to, clock.instant());
        return saved(order);
    }

    private static void checkVersion(CustomerOrder order, Integer version) {
        if (!Objects.equals(order.getVersion(), version)) {
            throw OrderErrors.versionMismatch(order.getVersion());
        }
    }

    /** Flush ngay để version mới có trong response và lỗi lock nổ ra trong transaction này. */
    private OrderDto saved(CustomerOrder order) {
        orders.flush();
        return views.one(order, OrderAccess.viewerCustomerId());
    }
}
