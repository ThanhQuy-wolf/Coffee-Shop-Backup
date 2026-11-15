package vn.drinkool.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import tools.jackson.databind.JsonNode;

class OrderWorkflowApiTest extends OrderTestSupport {

    private String orderPath(JsonNode order) {
        return "/api/v1/orders/" + order.get("id").asLong();
    }

    private static String version(int v) {
        return "{\"version\":" + v + "}";
    }

    @Test
    void staffMovesOrderThroughTheQueue() throws Exception {
        String staff = staffToken();
        JsonNode order = placeOk(customerToken(), cart(BLACK_COFFEE));
        String path = orderPath(order);

        call(GET, "/api/v1/orders?status=PENDING_PAYMENT,PAID&q=" + order.get("code").asString().substring(10),
                staff, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].customerPhone").value("*******321"));
        call(GET, "/api/v1/orders?status=READY", staff, null).andExpect(jsonPath("$.length()").value(0));
        call(GET, "/api/v1/orders?date=2020-01-01", staff, null).andExpect(jsonPath("$.length()").value(0));
        call(GET, "/api/v1/orders?status=WAITING", staff, null).andExpect(status().isBadRequest());

        call(POST, path + "/payment/confirm", staff, "{\"method\":\"CASH\",\"amount\":24000,\"version\":1}")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-26"));
        // Version kiểm trước trạng thái và số tiền
        call(POST, path + "/payment/confirm", staff, "{\"method\":\"CASH\",\"amount\":24000,\"version\":7}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.rule").value("BR-27"))
                .andExpect(jsonPath("$.currentVersion").value(1));
        call(POST, path + "/payment/confirm", staff, "{\"method\":\"CASH\",\"amount\":25000,\"version\":1}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.version").value(2))
                .andExpect(jsonPath("$.payment.method").value("CASH"))
                .andExpect(jsonPath("$.payment.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.payment.confirmedAt").isNotEmpty())
                .andExpect(jsonPath("$.paidAt").isNotEmpty());
        call(POST, path + "/payment/confirm", staff, "{\"method\":\"CASH\",\"amount\":25000,\"version\":2}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.rule").value("BR-26"));

        call(POST, path + "/complete", staff, version(2))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ORDER_STATE"))
                .andExpect(jsonPath("$.status").value("PAID"));
        call(POST, path + "/start", staff, version(2)).andExpect(jsonPath("$.status").value("PREPARING"));
        call(POST, path + "/ready", staff, version(3)).andExpect(jsonPath("$.status").value("READY"));
        call(POST, path + "/complete", staff, version(4))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.version").value(5))
                .andExpect(jsonPath("$.completedAt").isNotEmpty());
        call(POST, path + "/start", staff, "{}").andExpect(status().isBadRequest());

        flush();
        String action = jdbc.sql("SELECT action FROM audit_log WHERE entity_type = 'ORDER' AND entity_id = ?")
                .param(order.get("id").asLong()).query(String.class).single();
        assertThat(action).isEqualTo("PAYMENT_CONFIRMED");
    }

    @Test
    void guestReadsOwnOrderWithTokenAndEtag() throws Exception {
        JsonNode order = placeOk(null, cart(BLACK_COFFEE));
        String path = orderPath(order);
        String token = order.get("guestToken").asString();

        String etag = mvc.perform(get(path).header(OrderController.GUEST_TOKEN, token))
                .andExpect(status().isOk())
                .andExpect(header().string("ETag", "\"1-0\""))
                .andExpect(jsonPath("$.code").value(order.get("code").asString()))
                .andExpect(jsonPath("$.guestToken").doesNotExist())
                .andExpect(jsonPath("$.review").isEmpty())
                .andReturn().getResponse().getHeader("ETag");
        mvc.perform(get(path).header(OrderController.GUEST_TOKEN, token).header("If-None-Match", etag))
                .andExpect(status().isNotModified())
                .andExpect(content().string(""));
        mvc.perform(get(path).header(OrderController.GUEST_TOKEN, "gt_wrong"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
        mvc.perform(get(path)).andExpect(status().isNotFound());
        // Khách đã đăng nhập không xem được đơn của khách vãng lai
        call(GET, path, customerToken(), null).andExpect(status().isNotFound());
        call(GET, path, staffToken(), null).andExpect(status().isOk());
        call(GET, "/api/v1/orders/999999", staffToken(), null).andExpect(status().isNotFound());
    }

    @Test
    void guestCancelsPendingOrder() throws Exception {
        JsonNode order = placeOk(null, cart(BLACK_COFFEE));
        String path = orderPath(order);
        mvc.perform(post(path + "/cancel").contentType(MediaType.APPLICATION_JSON).content(version(1)))
                .andExpect(status().isNotFound());
        mvc.perform(post(path + "/cancel").header(OrderController.GUEST_TOKEN, order.get("guestToken").asString())
                        .contentType(MediaType.APPLICATION_JSON).content(version(1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.cancelReason").value("Khách huỷ"))
                .andExpect(jsonPath("$.payment.status").value("VOIDED"))
                .andExpect(jsonPath("$.version").value(2));
        call(POST, path + "/cancel", managerToken(), "{\"version\":2,\"reason\":\"x\"}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ORDER_STATE"));
    }

    @Test
    void onlyManagerCancelsPaidOrderWithReason() throws Exception {
        String customer = customerToken();
        JsonNode order = placeOk(customer, cart(BLACK_COFFEE));
        String path = orderPath(order);
        call(POST, path + "/payment/confirm", staffToken(), "{\"method\":\"QR\",\"amount\":25000,\"version\":1}")
                .andExpect(status().isOk());

        call(POST, path + "/cancel", customer, version(2))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.rule").value("BR-29"));
        call(POST, path + "/cancel", staffToken(), version(2))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.rule").value("BR-29"));
        String manager = managerToken();
        call(POST, path + "/cancel", manager, "{\"version\":2,\"reason\":\"  \"}")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-29"));
        call(POST, path + "/cancel", manager, "{\"version\":2,\"reason\":\"Hết nguyên liệu\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.cancelReason").value("Hết nguyên liệu"))
                .andExpect(jsonPath("$.payment.status").value("REFUNDED"));

        flush();
        assertThat(jdbc.sql("SELECT action FROM audit_log WHERE entity_type = 'ORDER' AND entity_id = ? ORDER BY id")
                .param(order.get("id").asLong()).query(String.class).list())
                .containsExactly("PAYMENT_CONFIRMED", "ORDER_REFUNDED");
    }

    @Test
    void staffCancelsPendingWithDefaultReason() throws Exception {
        JsonNode order = placeOk(null, cart(BLACK_COFFEE));
        call(POST, orderPath(order) + "/cancel", staffToken(), version(1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cancelReason").value("Nhân viên huỷ"));
    }

    @Test
    void queueIsForStaffOnly() throws Exception {
        call(GET, "/api/v1/orders", customerToken(), null).andExpect(status().isForbidden());
        call(GET, "/api/v1/orders", null, null).andExpect(status().isUnauthorized());
        JsonNode order = placeOk(null, cart(BLACK_COFFEE));
        call(POST, orderPath(order) + "/start", customerToken(), version(1)).andExpect(status().isForbidden());
        call(POST, orderPath(order) + "/payment/confirm", null,
                "{\"method\":\"QR\",\"amount\":25000,\"version\":1}").andExpect(status().isUnauthorized());
    }
}
