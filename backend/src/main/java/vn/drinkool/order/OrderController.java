package vn.drinkool.order;

import java.util.List;
import java.util.function.Supplier;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import vn.drinkool.order.OrderDtos.CancelRequest;
import vn.drinkool.order.OrderDtos.ConfirmPaymentRequest;
import vn.drinkool.order.OrderDtos.CreateOrderRequest;
import vn.drinkool.order.OrderDtos.OrderDto;
import vn.drinkool.order.OrderDtos.VersionRequest;

@RestController
@RequestMapping("/api/v1")
@Validated
public class OrderController {

    static final String GUEST_TOKEN = "X-Guest-Token";

    private final OrderPlacementService placement;
    private final OrderQueryService queries;
    private final OrderWorkflowService workflow;

    OrderController(OrderPlacementService placement, OrderQueryService queries, OrderWorkflowService workflow) {
        this.placement = placement;
        this.queries = queries;
        this.workflow = workflow;
    }

    /** O-1: 201 khi tạo mới, 200 khi gửi lại cùng Idempotency-Key (BR-24). */
    @PostMapping("/orders")
    public ResponseEntity<OrderDto> create(@RequestHeader(name = "Idempotency-Key", required = false) String key,
                                           @Valid @RequestBody CreateOrderRequest req) {
        OrderPlacementService.Placed placed;
        try {
            placed = placement.place(key, req);
        } catch (DataIntegrityViolationException e) {
            // Hai request cùng khoá chạy song song: request thua đọc lại đơn của request thắng
            placed = placement.replayAfterRace(key, req).orElseThrow(() -> e);
        }
        return ResponseEntity.status(placed.created() ? HttpStatus.CREATED : HttpStatus.OK).body(placed.order());
    }

    /** O-2 */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderDto> get(@PathVariable Long orderId,
                                        @RequestHeader(name = GUEST_TOKEN, required = false) String guestToken,
                                        @RequestHeader(name = HttpHeaders.IF_NONE_MATCH, required = false)
                                        String ifNoneMatch) {
        return queries.get(orderId, guestToken, ifNoneMatch)
                .map(t -> ResponseEntity.ok().eTag(t.etag()).body(t.order()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_MODIFIED).eTag(ifNoneMatch).build());
    }

    /** O-3 */
    @GetMapping("/me/orders")
    public List<OrderDto> mine() {
        return queries.mine();
    }

    /** O-4 */
    @GetMapping("/orders")
    public List<OrderDto> queue(@RequestParam(required = false) String status,
                                @RequestParam(required = false) String q,
                                @RequestParam(required = false) String date) {
        return queries.queue(status, q, date);
    }

    /** O-5 */
    @PostMapping("/orders/{orderId}/payment/confirm")
    public OrderDto confirmPayment(@PathVariable Long orderId, @Valid @RequestBody ConfirmPaymentRequest req) {
        return guarded(orderId, () -> workflow.confirmPayment(orderId, req));
    }

    /** O-6 */
    @PostMapping("/orders/{orderId}/start")
    public OrderDto start(@PathVariable Long orderId, @Valid @RequestBody VersionRequest req) {
        return guarded(orderId, () -> workflow.start(orderId, req.version()));
    }

    /** O-7 */
    @PostMapping("/orders/{orderId}/ready")
    public OrderDto ready(@PathVariable Long orderId, @Valid @RequestBody VersionRequest req) {
        return guarded(orderId, () -> workflow.markReady(orderId, req.version()));
    }

    /** O-8 */
    @PostMapping("/orders/{orderId}/complete")
    public OrderDto complete(@PathVariable Long orderId, @Valid @RequestBody VersionRequest req) {
        return guarded(orderId, () -> workflow.complete(orderId, req.version()));
    }

    /** O-9 */
    @PostMapping("/orders/{orderId}/cancel")
    public OrderDto cancel(@PathVariable Long orderId, @Valid @RequestBody CancelRequest req,
                           @RequestHeader(name = GUEST_TOKEN, required = false) String guestToken) {
        return guarded(orderId, () -> workflow.cancel(orderId, req, guestToken));
    }

    /** BR-27: hai người cùng qua bước kiểm version, người ghi sau nhận 409 kèm version mới. */
    private OrderDto guarded(Long orderId, Supplier<OrderDto> action) {
        try {
            return action.get();
        } catch (ObjectOptimisticLockingFailureException e) {
            throw OrderErrors.versionMismatch(queries.currentVersion(orderId));
        }
    }
}
