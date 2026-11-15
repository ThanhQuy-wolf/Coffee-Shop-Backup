package vn.drinkool.order;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import tools.jackson.databind.JsonNode;

import vn.drinkool.IntegrationTest;

/** Giỏ hàng mẫu dựa trên dữ liệu demo (db/dev/V1000). */
abstract class OrderTestSupport extends IntegrationTest {

    /** Cà phê đen size M, 100% đường, đá bình thường: 25 000đ. */
    static final String BLACK_COFFEE = """
            {"type":"PRODUCT","id":1,"quantity":1,"unitPrice":25000,"optionValueIds":[1,3,8]}""";

    @Autowired
    protected JdbcClient jdbc;

    static String cart(String... lines) {
        return "{\"paymentMethod\":\"QR\",\"tableLabel\":\"B05\",\"note\":\"Ít đá\",\"items\":["
                + String.join(",", lines) + "]}";
    }

    protected ResultActions placeOrder(String key, String token, String body) throws Exception {
        MockHttpServletRequestBuilder req = post("/api/v1/orders").contentType(MediaType.APPLICATION_JSON)
                .content(body);
        if (key != null) {
            req.header("Idempotency-Key", key);
        }
        if (token != null) {
            req.header("Authorization", bearer(token));
        }
        return mvc.perform(req);
    }

    protected JsonNode placeOk(String token, String body) throws Exception {
        String res = placeOrder(UUID.randomUUID().toString(), token, body)
                .andReturn().getResponse().getContentAsString();
        JsonNode node = json.readTree(res);
        if (!node.has("id") || node.get("id").isNull()) {
            throw new AssertionError("Tạo đơn thất bại: " + res);
        }
        return node;
    }

    protected String customerToken() throws Exception {
        return postJson("/api/customer/login", "{\"phone\":\"0987654321\",\"password\":\"user1\"}")
                .get("accessToken").asString();
    }

    protected String staffToken() throws Exception {
        return staffToken("an", "123456");
    }
}
