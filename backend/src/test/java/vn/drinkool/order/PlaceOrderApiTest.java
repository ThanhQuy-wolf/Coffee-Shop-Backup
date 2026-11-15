package vn.drinkool.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.PATCH;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import tools.jackson.databind.JsonNode;

class PlaceOrderApiTest extends OrderTestSupport {

    /** Trà đào size L, 50% đường, ít đá, trân châu đen: 35 000 + 6 000 + 5 000. */
    private static final String PEACH_TEA = """
            {"type":"PRODUCT","id":5,"quantity":2,"unitPrice":46000,"optionValueIds":[2,5,9,11]}""";

    /** Combo cà phê đôi: ly 1 size M, ly 2 size L (+6 000); hai bánh mì không có tuỳ chọn. */
    private static final String COFFEE_COMBO = """
            {"type":"COMBO","id":1,"quantity":1,"unitPrice":81000,
             "components":[{"no":1,"optionValueIds":[1,3,8]},{"no":2,"optionValueIds":[2,3,8]}]}""";

    @Test
    void guestPlacesOrderWithOptionsAndCombo() throws Exception {
        String key = UUID.randomUUID().toString();
        String res = placeOrder(key, null, cart(PEACH_TEA, COFFEE_COMBO))
                .andExpect(status().isCreated())
                .andExpect(header().string("Content-Type", startsWith("application/json")))
                .andExpect(jsonPath("$.code").value(matchesPattern("DH-\\d{6}-\\d{4}")))
                .andExpect(jsonPath("$.status").value("PENDING_PAYMENT"))
                .andExpect(jsonPath("$.total").value(2 * 46000 + 81000))
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.guestToken").value(startsWith("gt_")))
                .andExpect(jsonPath("$.tableLabel").value("B05"))
                .andExpect(jsonPath("$.payment.method").value("QR"))
                .andExpect(jsonPath("$.payment.status").value("PENDING"))
                .andExpect(jsonPath("$.items[0].name").value("Trà Đào Cam Sả"))
                .andExpect(jsonPath("$.items[0].lineTotal").value(92000))
                .andExpect(jsonPath("$.items[0].options[0].valueName").value("Size L"))
                .andExpect(jsonPath("$.items[0].options[3].groupName").value("Topping"))
                .andExpect(jsonPath("$.items[0].options[0].componentNo").doesNotExist())
                .andExpect(jsonPath("$.items[1].options.length()").value(6))
                .andExpect(jsonPath("$.items[1].options[3].componentNo").value(2))
                .andExpect(jsonPath("$.items[1].options[3].componentName").value("Cà Phê Đen"))
                .andExpect(jsonPath("$.items[1].options[3].priceDelta").value(6000))
                .andReturn().getResponse().getContentAsString();
        JsonNode order = json.readTree(res);
        assertThat(order.get("payment").get("transferContent").asString()).isEqualTo(order.get("code").asString());
        assertThat(order.has("customerPhone")).isTrue();

        // BR-17, BR-51: giá vốn chụp lúc đặt, gồm cả phần chênh của tuỳ chọn
        flush();
        List<Long> costs = jdbc.sql("SELECT unit_cost FROM order_item WHERE order_id = ? ORDER BY id")
                .param(order.get("id").asLong()).query(Long.class).list();
        assertThat(costs).containsExactly(13000L + 2500 + 1500, 2 * 10000L + 2 * 8000 + 2500);
        Long categoryOfCombo = jdbc.sql(
                        "SELECT category_id_snapshot FROM order_item WHERE order_id = ? AND item_type = 'COMBO'")
                .param(order.get("id").asLong()).query(Long.class).optional().orElse(null);
        assertThat(categoryOfCombo).isNull();
    }

    @Test
    void codesCountUpWithinTheDay() throws Exception {
        String first = placeOk(null, cart(BLACK_COFFEE)).get("code").asString();
        String second = placeOk(null, cart(BLACK_COFFEE)).get("code").asString();
        assertThat(first.substring(0, 10)).isEqualTo(second.substring(0, 10));
        assertThat(Integer.parseInt(second.substring(10))).isEqualTo(Integer.parseInt(first.substring(10)) + 1);
    }

    @Test
    void sameKeyReplaysAndDifferentCartIsRejected() throws Exception {
        String key = UUID.randomUUID().toString();
        String id = json.readTree(placeOrder(key, null, cart(PEACH_TEA)).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString()).get("id").asString();
        // Đổi thứ tự id tuỳ chọn vẫn là cùng một giỏ
        String reordered = PEACH_TEA.replace("[2,5,9,11]", "[11,9,5,2]");
        placeOrder(key, null, cart(reordered))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(Long.valueOf(id)))
                .andExpect(jsonPath("$.guestToken").value(startsWith("gt_")));
        placeOrder(key, null, cart(PEACH_TEA.replace("\"quantity\":2", "\"quantity\":3")))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-24"));
        // Cùng khoá nhưng người đặt khác
        placeOrder(key, customerToken(), cart(PEACH_TEA))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-24"));
        assertThat(jdbc.sql("SELECT count(*) FROM customer_order").query(Long.class).single()).isEqualTo(1L);
    }

    @Test
    void keyIsRequiredAndStaffCannotOrder() throws Exception {
        placeOrder(null, null, cart(BLACK_COFFEE))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION"));
        placeOrder("x".repeat(65), null, cart(BLACK_COFFEE))
                .andExpect(status().isBadRequest());
        placeOrder(UUID.randomUUID().toString(), staffToken(), cart(BLACK_COFFEE))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        placeOrder(UUID.randomUUID().toString(), null, "{\"items\":[]}")
                .andExpect(status().isBadRequest());
    }

    @Test
    void quantityAndEmptyCartBreakBr23() throws Exception {
        placeOrder(UUID.randomUUID().toString(), null, cart())
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-23"));
        // P-08 = 20; BR-23 dừng ngay, kể cả khi dòng khác sai giá
        placeOrder(UUID.randomUUID().toString(), null,
                cart(BLACK_COFFEE.replace("\"quantity\":1", "\"quantity\":21"),
                        BLACK_COFFEE.replace("25000", "1")))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-23"))
                .andExpect(jsonPath("$.errors[0].line").value(0))
                .andExpect(jsonPath("$.errors[0].max").value(20));
    }

    @Test
    void unavailableItemsAreReportedBeforeSelectionAndPrice() throws Exception {
        String manager = managerToken();
        call(PATCH, "/api/v1/products/3/availability", manager, "{\"isAvailable\":false}")
                .andExpect(status().isOk());
        call(PATCH, "/api/v1/option-values/11/availability", manager, "{\"isAvailable\":false}")
                .andExpect(status().isOk());
        String disabledProduct = """
                {"type":"PRODUCT","id":3,"quantity":1,"unitPrice":32000,"optionValueIds":[1,3,8]}""";
        String disabledCombo = """
                {"type":"COMBO","id":3,"quantity":1,"unitPrice":48000,"components":[]}""";
        String badSelection = """
                {"type":"PRODUCT","id":1,"quantity":1,"unitPrice":25000,"optionValueIds":[]}""";
        placeOrder(UUID.randomUUID().toString(), null,
                cart(BLACK_COFFEE.replace("25000", "1"), disabledProduct, PEACH_TEA, disabledCombo, badSelection))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-21"))
                .andExpect(jsonPath("$.errors.length()").value(3))
                .andExpect(jsonPath("$.errors[0].line").value(1))
                .andExpect(jsonPath("$.errors[0].reason").value("UNAVAILABLE"))
                .andExpect(jsonPath("$.errors[1].line").value(2))
                .andExpect(jsonPath("$.errors[1].optionValueId").value(11))
                .andExpect(jsonPath("$.errors[1].reason").value("OPTION_UNAVAILABLE"))
                .andExpect(jsonPath("$.errors[2].itemType").value("COMBO"))
                .andExpect(jsonPath("$.errors[2].id").value(3));
    }

    @Test
    void invalidSelectionsBreakBr18() throws Exception {
        String noSize = """
                {"type":"PRODUCT","id":1,"quantity":1,"unitPrice":25000,"optionValueIds":[3,8]}""";
        String foreignValue = """
                {"type":"PRODUCT","id":8,"quantity":1,"unitPrice":38000,"optionValueIds":[8,1]}""";
        String comboMissingCup = """
                {"type":"COMBO","id":1,"quantity":1,"unitPrice":75000,
                 "components":[{"no":1,"optionValueIds":[1,3,8]},{"no":5,"optionValueIds":[]}]}""";
        String comboFlatOptions = """
                {"type":"COMBO","id":1,"quantity":1,"unitPrice":75000,"optionValueIds":[1]}""";
        placeOrder(UUID.randomUUID().toString(), null,
                cart(noSize, foreignValue, comboMissingCup, comboFlatOptions))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-18"))
                .andExpect(jsonPath("$.errors[0].line").value(0))
                .andExpect(jsonPath("$.errors[0].groupId").value(1))
                .andExpect(jsonPath("$.errors[0].message").value("Chưa chọn size"))
                .andExpect(jsonPath("$.errors[1].line").value(1))
                .andExpect(jsonPath("$.errors[1].groupId").value(0))
                .andExpect(jsonPath("$.errors[2].line").value(2))
                .andExpect(jsonPath("$.errors[2].componentNo").value(5))
                .andExpect(jsonPath("$.errors[3].componentNo").value(2))
                .andExpect(jsonPath("$.errors[3].groupId").value(1))
                .andExpect(jsonPath("$.errors[6].line").value(3))
                .andExpect(jsonPath("$.errors[6].groupId").value(0));
    }

    @Test
    void stalePriceReturnsCurrentPrice() throws Exception {
        placeOrder(UUID.randomUUID().toString(), null,
                cart(BLACK_COFFEE, PEACH_TEA.replace("46000", "41000")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.rule").value("BR-22"))
                .andExpect(jsonPath("$.errors.length()").value(1))
                .andExpect(jsonPath("$.errors[0].line").value(1))
                .andExpect(jsonPath("$.errors[0].currentPrice").value(46000));
    }

    @Test
    void customerOrderShowsInHistoryWithFullPhone() throws Exception {
        String token = customerToken();
        JsonNode order = placeOk(token, cart(BLACK_COFFEE));
        assertThat(order.has("guestToken")).isFalse();
        assertThat(order.get("customerPhone").asString()).isEqualTo("0987654321");
        placeOk(token, cart(PEACH_TEA));
        call(GET, "/api/v1/me/orders", token, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].id").value(order.get("id").asLong()))
                .andExpect(jsonPath("$[0].items[0].name").value("Trà Đào Cam Sả"));
        call(GET, "/api/v1/me/orders", staffToken(), null).andExpect(status().isForbidden());
    }
}
