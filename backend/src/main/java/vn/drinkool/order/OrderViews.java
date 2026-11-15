package vn.drinkool.order;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import vn.drinkool.auth.AppUser;
import vn.drinkool.auth.AppUserRepository;
import vn.drinkool.common.config.Times;
import vn.drinkool.order.OrderDtos.ItemDto;
import vn.drinkool.order.OrderDtos.OptionDto;
import vn.drinkool.order.OrderDtos.OrderDto;
import vn.drinkool.order.OrderDtos.PaymentDto;
import vn.drinkool.review.ReviewDto;
import vn.drinkool.review.ReviewQueries;
import vn.drinkool.shop.ShopService;

/** Dựng kiểu {@code Order} chung cho O-1 → O-9. Đọc thanh toán, đánh giá, số điện thoại theo lô. */
@Component
class OrderViews {

    private final PaymentRepository payments;
    private final AppUserRepository users;
    private final ShopService shop;
    private final ReviewQueries reviews;

    OrderViews(PaymentRepository payments, AppUserRepository users, ShopService shop, ReviewQueries reviews) {
        this.payments = payments;
        this.users = users;
        this.shop = shop;
        this.reviews = reviews;
    }

    /** @param viewerCustomerId id khách đang xem, để quyết định có che số điện thoại không (NFR-07) */
    OrderDto one(CustomerOrder order, Long viewerCustomerId) {
        return many(List.of(order), viewerCustomerId).getFirst();
    }

    List<OrderDto> many(List<CustomerOrder> orders, Long viewerCustomerId) {
        if (orders.isEmpty()) {
            return List.of();
        }
        List<Long> ids = orders.stream().map(CustomerOrder::getId).toList();
        Map<Long, Payment> paymentByOrder = payments.findByOrderIdIn(ids).stream()
                .collect(Collectors.toMap(Payment::getOrderId, Function.identity()));
        Map<Long, ReviewDto> reviewByOrder = reviews.byOrderIds(ids);
        Map<Long, String> phoneById = users.findAllById(orders.stream()
                        .map(CustomerOrder::getCustomerId).filter(id -> id != null).distinct().toList())
                .stream()
                .filter(u -> u.getPhone() != null)
                .collect(Collectors.toMap(AppUser::getId, AppUser::getPhone));
        int timeout = shop.current().getPaymentTimeoutMinutes();
        return orders.stream()
                .map(o -> toDto(o, paymentByOrder.get(o.getId()), reviewByOrder.get(o.getId()),
                        phone(phoneById.get(o.getCustomerId()), o.getCustomerId(), viewerCustomerId), timeout))
                .toList();
    }

    private static String phone(String phone, Long ownerId, Long viewerCustomerId) {
        if (phone == null) {
            return null;
        }
        if (ownerId.equals(viewerCustomerId) || phone.length() <= 3) {
            return phone;
        }
        return "*".repeat(phone.length() - 3) + phone.substring(phone.length() - 3);
    }

    private static OrderDto toDto(CustomerOrder o, Payment p, ReviewDto review, String phone, int timeoutMinutes) {
        PaymentDto payment = p == null ? null : new PaymentDto(p.getMethod(), p.getStatus(), p.getAmount(),
                o.getCode(), Times.toShopTime(p.getConfirmedAt()));
        List<ItemDto> items = o.getItems().stream()
                .map(i -> new ItemDto(i.getItemType(), i.getRefId(), i.getNameSnapshot(), i.getUnitPrice(),
                        i.getQuantity(), i.getLineTotal(), i.getOptions().stream()
                        .map(op -> new OptionDto(op.getComponentNo(), op.getComponentNameSnapshot(),
                                op.getOptionValueId(), op.getGroupNameSnapshot(), op.getValueNameSnapshot(),
                                op.getPriceDelta()))
                        .toList()))
                .toList();
        return new OrderDto(o.getId(), o.getCode(), o.getStatus(), o.getTotal(), o.getVersion(), o.getTableLabel(),
                o.getNote(), o.getCustomerId(), phone, null,
                Times.toShopTime(o.getCreatedAt().plusSeconds(timeoutMinutes * 60L)), payment, items, review,
                Times.toShopTime(o.getCreatedAt()), Times.toShopTime(o.getPaidAt()),
                Times.toShopTime(o.getCompletedAt()), Times.toShopTime(o.getCancelledAt()), o.getCancelReason());
    }
}
