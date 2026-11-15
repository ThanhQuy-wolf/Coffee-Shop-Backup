package vn.drinkool.order;

import java.time.OffsetDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import vn.drinkool.review.ReviewDto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Request và response của nhóm O (docs/05-api.md §2.4). */
public final class OrderDtos {

    private OrderDtos() {
    }

    public record CreateOrderRequest(
            @NotNull PaymentMethod paymentMethod,
            @Size(max = 16) String tableLabel,
            @Size(max = 300) String note,
            List<@Valid @NotNull LineRequest> items) {
    }

    public record LineRequest(
            @NotNull OrderItem.Type type,
            @NotNull Long id,
            int quantity,
            long unitPrice,
            List<Long> optionValueIds,
            List<@Valid @NotNull ComponentRequest> components) {
    }

    public record ComponentRequest(int no, List<Long> optionValueIds) {
    }

    public record VersionRequest(@NotNull Integer version) {
    }

    public record ConfirmPaymentRequest(@NotNull PaymentMethod method, @NotNull Long amount,
                                        @NotNull Integer version) {
    }

    public record CancelRequest(@NotNull Integer version, @Size(max = 300) String reason) {
    }

    public record OrderDto(
            Long id,
            String code,
            OrderStatus status,
            long total,
            int version,
            String tableLabel,
            String note,
            Long customerId,
            String customerPhone,
            @JsonInclude(JsonInclude.Include.NON_NULL) String guestToken,
            OffsetDateTime paymentDeadline,
            PaymentDto payment,
            List<ItemDto> items,
            ReviewDto review,
            OffsetDateTime createdAt,
            OffsetDateTime paidAt,
            OffsetDateTime completedAt,
            OffsetDateTime cancelledAt,
            String cancelReason) {

        OrderDto withGuestToken(String token) {
            return new OrderDto(id, code, status, total, version, tableLabel, note, customerId, customerPhone,
                    token, paymentDeadline, payment, items, review, createdAt, paidAt, completedAt, cancelledAt,
                    cancelReason);
        }
    }

    public record PaymentDto(PaymentMethod method, Payment.Status status, long amount, String transferContent,
                             OffsetDateTime confirmedAt) {
    }

    public record ItemDto(OrderItem.Type type, Long id, String name, long unitPrice, int quantity, long lineTotal,
                          List<OptionDto> options) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record OptionDto(Integer componentNo, String componentName, Long optionValueId, String groupName,
                            String valueName, long priceDelta) {
    }
}
