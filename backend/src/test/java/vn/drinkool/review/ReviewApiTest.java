package vn.drinkool.review;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import tools.jackson.databind.JsonNode;

import vn.drinkool.IntegrationTest;

class ReviewApiTest extends IntegrationTest {

    private static final String CART = """
            {"paymentMethod":"CASH","items":[{"type":"PRODUCT","id":1,"quantity":1,"unitPrice":25000,
             "optionValueIds":[1,3,8]}]}""";

    @Autowired
    private JdbcClient jdbc;

    private String customer() throws Exception {
        return postJson("/api/customer/login", "{\"phone\":\"0987654321\",\"password\":\"user1\"}")
                .get("accessToken").asString();
    }

    private JsonNode order(String token) throws Exception {
        var req = MockMvcRequestBuilders.post("/api/v1/orders").contentType(MediaType.APPLICATION_JSON)
                .content(CART).header("Idempotency-Key", UUID.randomUUID().toString());
        if (token != null) {
            req.header("Authorization", bearer(token));
        }
        return json.readTree(mvc.perform(req).andReturn().getResponse().getContentAsString());
    }

    /** Đưa đơn tới COMPLETED qua O-5 → O-8. */
    private JsonNode completed(String token) throws Exception {
        JsonNode o = order(token);
        String path = "/api/v1/orders/" + o.get("id").asLong();
        String staff = staffToken("an", "123456");
        call(POST, path + "/payment/confirm", staff, "{\"method\":\"CASH\",\"amount\":25000,\"version\":1}");
        call(POST, path + "/start", staff, "{\"version\":2}");
        call(POST, path + "/ready", staff, "{\"version\":3}");
        call(POST, path + "/complete", staff, "{\"version\":4}").andExpect(status().isOk());
        return o;
    }

    private static String review(JsonNode order) {
        return "/api/v1/orders/" + order.get("id").asLong() + "/review";
    }

    @Test
    void customerReviewsCompletedOrderOnce() throws Exception {
        String token = customer();
        JsonNode o = completed(token);
        String res = call(POST, review(o), token, "{\"rating\":5,\"comment\":\"  Ngon  \"}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value(o.get("id").asLong()))
                .andExpect(jsonPath("$.orderCode").value(o.get("code").asString()))
                .andExpect(jsonPath("$.customerName").value("Khách hàng demo"))
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment").value("Ngon"))
                .andReturn().getResponse().getContentAsString();
        long reviewId = json.readTree(res).get("id").asLong();
        call(POST, review(o), token, "{\"rating\":4}")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-31"));
        // R-46: ETag của O-2 đổi khi có đánh giá dù version không đổi
        call(GET, "/api/v1/orders/" + o.get("id").asLong(), token, null)
                .andExpect(header().string("ETag", "\"5-" + reviewId + "\""))
                .andExpect(jsonPath("$.review.rating").value(5))
                .andExpect(jsonPath("$.review.orderCode").value(o.get("code").asString()));
    }

    @Test
    void rulesBr30AndBr31() throws Exception {
        String token = customer();
        call(POST, review(order(token)), token, "{\"rating\":5}")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-30"));
        call(POST, review(completed(null)), token, "{\"rating\":5}")
                .andExpect(jsonPath("$.rule").value("BR-30"));
        JsonNode o = completed(token);
        call(POST, review(o), token, "{\"rating\":6}").andExpect(jsonPath("$.rule").value("BR-31"));
        call(POST, review(o), token, "{}").andExpect(jsonPath("$.rule").value("BR-31"));
        call(POST, review(o), token, "{\"rating\":3,\"comment\":\"" + "a".repeat(501) + "\"}")
                .andExpect(jsonPath("$.rule").value("BR-31"));
        flush();
        jdbc.sql("UPDATE customer_order SET completed_at = now() - interval '8 days' WHERE id = ?")
                .param(o.get("id").asLong()).update();
        em.clear();
        call(POST, review(o), token, "{\"rating\":3}")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-30"));
        call(POST, "/api/v1/orders/999999/review", token, "{\"rating\":3}").andExpect(status().isNotFound());
        call(POST, review(o), staffToken("an", "123456"), "{\"rating\":3}").andExpect(status().isForbidden());
    }

    @Test
    void emptyListHasZeroAverage() throws Exception {
        call(GET, "/api/v1/reviews", managerToken(), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0))
                .andExpect(jsonPath("$.average").value(0.0))
                .andExpect(jsonPath("$.countByRating.5").value(0));
    }

    @Test
    void managerListsReviewsWithStats() throws Exception {
        String token = customer();
        call(POST, review(completed(token)), token, "{\"rating\":5}").andExpect(status().isCreated());
        call(POST, review(completed(token)), token, "{\"rating\":4}").andExpect(status().isCreated());
        call(POST, review(completed(token)), token, "{\"rating\":4,\"comment\":\"\"}")
                .andExpect(jsonPath("$.comment").isEmpty());
        String manager = managerToken();
        call(GET, "/api/v1/reviews", manager, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.items[0].rating").value(4))
                .andExpect(jsonPath("$.countByRating.4").value(2))
                .andExpect(jsonPath("$.countByRating.1").value(0));
        JsonNode filtered = json.readTree(call(GET, "/api/v1/reviews?rating=5&size=1", manager, null)
                .andReturn().getResponse().getContentAsString());
        assertThat(filtered.get("total").asLong()).isEqualTo(1);
        assertThat(filtered.get("average").asDouble()).isCloseTo(13.0 / 3, org.assertj.core.data.Offset.offset(1e-9));
        assertThat(filtered.get("countByRating").get("5").asLong()).isEqualTo(1);
        call(GET, "/api/v1/reviews?size=101", manager, null).andExpect(status().isBadRequest());
        call(GET, "/api/v1/reviews", staffToken("an", "123456"), null).andExpect(status().isForbidden());
    }
}
