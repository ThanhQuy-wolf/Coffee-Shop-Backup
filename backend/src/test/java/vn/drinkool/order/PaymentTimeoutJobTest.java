package vn.drinkool.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import tools.jackson.databind.JsonNode;

class PaymentTimeoutJobTest extends OrderTestSupport {

    @Autowired
    private PaymentTimeoutJob job;

    private void ageMinutes(JsonNode order, int minutes) {
        flush();
        jdbc.sql("UPDATE customer_order SET created_at = now() - make_interval(mins => ?) WHERE id = ?")
                .param(minutes).param(order.get("id").asLong()).update();
        em.clear();
    }

    @Test
    void cancelsOnlyExpiredPendingOrdersAndIsIdempotent() throws Exception {
        String staff = staffToken();
        JsonNode expired = placeOk(null, cart(BLACK_COFFEE));
        JsonNode fresh = placeOk(null, cart(BLACK_COFFEE));
        JsonNode paid = placeOk(null, cart(BLACK_COFFEE));
        call(POST, "/api/v1/orders/" + paid.get("id").asLong() + "/payment/confirm", staff,
                "{\"method\":\"CASH\",\"amount\":25000,\"version\":1}").andExpect(status().isOk());
        // P-06 = 15 phút
        ageMinutes(expired, 16);
        ageMinutes(fresh, 14);
        ageMinutes(paid, 30);

        assertThat(job.cancelExpired()).isEqualTo(1);
        assertThat(job.cancelExpired()).isZero();

        call(GET, "/api/v1/orders/" + expired.get("id").asLong(), staff, null)
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.cancelReason").value("PAYMENT_TIMEOUT"))
                .andExpect(jsonPath("$.version").value(2))
                .andExpect(jsonPath("$.payment.status").value("VOIDED"));
        call(GET, "/api/v1/orders/" + fresh.get("id").asLong(), staff, null)
                .andExpect(jsonPath("$.status").value("PENDING_PAYMENT"));
        call(GET, "/api/v1/orders/" + paid.get("id").asLong(), staff, null)
                .andExpect(jsonPath("$.status").value("PAID"));
        // Nhân viên còn giữ version cũ thì nhận BR-27 thay vì xác nhận đơn đã bị huỷ
        call(POST, "/api/v1/orders/" + expired.get("id").asLong() + "/payment/confirm", staff,
                "{\"method\":\"CASH\",\"amount\":25000,\"version\":1}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.rule").value("BR-27"))
                .andExpect(jsonPath("$.currentVersion").value(2));
    }
}
