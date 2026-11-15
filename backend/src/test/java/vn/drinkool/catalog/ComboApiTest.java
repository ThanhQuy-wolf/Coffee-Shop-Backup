package vn.drinkool.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpMethod.DELETE;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.PATCH;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.HttpMethod.PUT;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import vn.drinkool.IntegrationTest;
import vn.drinkool.common.audit.AuditLogRepository;

class ComboApiTest extends IntegrationTest {

    private static final String COMBO = """
            {"name":"Combo Chiều","description":"","price":60000,"imageUrl":null,"isAvailable":true,
             "items":[{"productId":15,"quantity":1},{"productId":3,"quantity":1}]}""";

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    AuditLogRepository auditLogs;

    @Test
    void listShowsSellableFlagFromComponents() throws Exception {
        String token = staffToken("an", "123456");
        call(GET, "/api/v1/combos", token, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].sellable").value(true))
                .andExpect(jsonPath("$[2].sellable").value(false));
        call(PATCH, "/api/v1/products/14/availability", token, "{\"isAvailable\":false}");
        call(GET, "/api/v1/combos", token, null).andExpect(jsonPath("$[0].sellable").value(false));
    }

    @Test
    void itemOrderIsKeptForComponentNumbering() throws Exception {
        call(POST, "/api/v1/combos", managerToken(), COMBO)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.items[0].productId").value(15))
                .andExpect(jsonPath("$.items[1].productId").value(3))
                .andExpect(jsonPath("$.sellable").value(true));
        call(GET, "/api/v1/menu?q=chiều", null, null)
                .andExpect(jsonPath("$.combos[0].items[0].productId").value(15));
    }

    @Test
    void comboRules() throws Exception {
        String token = managerToken();
        call(POST, "/api/v1/combos", token, COMBO.replace(",{\"productId\":3,\"quantity\":1}", ""))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-13"));
        call(POST, "/api/v1/combos", token, COMBO.replace("60000", "0"))
                .andExpect(jsonPath("$.rule").value("BR-10"));
        call(POST, "/api/v1/combos", token, COMBO.replace("\"productId\":3", "\"productId\":15"))
                .andExpect(status().isBadRequest());
        call(POST, "/api/v1/combos", token, COMBO.replace("\"productId\":3", "\"productId\":999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateReplacesItemsAndAuditsPrice() throws Exception {
        String body = COMBO.replace("Combo Chiều", "Combo Cà Phê Đôi").replace("60000", "79000");
        call(PUT, "/api/v1/combos/1", managerToken(), body)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].productId").value(15));
        assertThat(auditLogs.findByEntityTypeAndEntityIdOrderByIdAsc("COMBO", 1L)).hasSize(1);
    }

    @Test
    void onlyManagerTogglesCombo() throws Exception {
        call(PATCH, "/api/v1/combos/3/availability", staffToken("an", "123456"), "{\"isAvailable\":true}")
                .andExpect(status().isForbidden());
        call(PATCH, "/api/v1/combos/3/availability", managerToken(), "{\"isAvailable\":true}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sellable").value(true));
    }

    @Test
    void deleteIsHardUntilSoldAndFreesProduct() throws Exception {
        String token = managerToken();
        call(DELETE, "/api/v1/combos/3", token, null).andExpect(status().isNoContent());
        flush();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM combo WHERE id = 3", Integer.class)).isZero();
        // Bánh flan không còn trong combo nào nên xoá được
        call(DELETE, "/api/v1/products/15", token, null).andExpect(status().isNoContent());

        jdbc.update("""
                INSERT INTO customer_order (id, code, customer_id, status, total, idempotency_key)
                VALUES (901, 'DH-260410-0901', 10, 'COMPLETED', 75000, 'k-901')""");
        jdbc.update("""
                INSERT INTO order_item (order_id, item_type, combo_id, name_snapshot, unit_price, unit_cost,
                                        quantity, line_total)
                VALUES (901, 'COMBO', 1, 'Combo Cà Phê Đôi', 75000, 36000, 1, 75000)""");
        call(DELETE, "/api/v1/combos/1", token, null).andExpect(status().isNoContent());
        flush();
        assertThat(jdbc.queryForObject("SELECT deleted_at IS NOT NULL FROM combo WHERE id = 1", Boolean.class))
                .isTrue();
        // R-38: combo đã xoá mềm vẫn giữ combo_item, nên món 14 chỉ được xoá mềm
        call(DELETE, "/api/v1/products/14", token, null).andExpect(status().isNoContent());
        flush();
        assertThat(jdbc.queryForObject("SELECT deleted_at IS NOT NULL FROM product WHERE id = 14", Boolean.class))
                .isTrue();
    }
}
