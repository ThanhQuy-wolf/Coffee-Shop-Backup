package vn.drinkool.catalog;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.HttpMethod.DELETE;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.PATCH;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.HttpMethod.PUT;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import vn.drinkool.IntegrationTest;
import vn.drinkool.common.audit.AuditLog;
import vn.drinkool.common.audit.AuditLogRepository;

class ProductApiTest extends IntegrationTest {

    private static final String NEW_PRODUCT = """
            {"categoryId":1,"name":"Cà Phê Muối","description":"Kem muối","price":39000,"costPrice":14000,
             "imageUrl":"/imgs/x.jpg","isAvailable":true,"optionGroupIds":[3,1]}""";

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    AuditLogRepository auditLogs;

    @Test
    void listIncludesCostAndFiltersByCategory() throws Exception {
        call(GET, "/api/v1/products?categoryId=2", staffToken("an", "123456"), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].costPrice").value(13000));
    }

    @Test
    void createKeepsOptionGroupOrder() throws Exception {
        call(POST, "/api/v1/products", managerToken(), NEW_PRODUCT)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.optionGroupIds[0]").value(3))
                .andExpect(jsonPath("$.optionGroupIds[1]").value(1));
        call(GET, "/api/v1/menu?q=muối", null, null).andExpect(jsonPath("$.products[0].name").value("Cà Phê Muối"));
    }

    @Test
    void productRules() throws Exception {
        String token = managerToken();
        call(POST, "/api/v1/products", token, NEW_PRODUCT.replace("Cà Phê Muối", "cà phê đen"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.rule").value("BR-12"));
        call(POST, "/api/v1/products", token, NEW_PRODUCT.replace("39000", "0"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-10"));
        call(POST, "/api/v1/products", token, NEW_PRODUCT.replace("14000", "-1"))
                .andExpect(jsonPath("$.rule").value("BR-10"));
        call(POST, "/api/v1/products", token, NEW_PRODUCT.replace("\"categoryId\":1", "\"categoryId\":99"))
                .andExpect(status().isNotFound());
        call(POST, "/api/v1/products", token, NEW_PRODUCT.replace("[3,1]", "[1,1]"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void priceChangeIsAudited() throws Exception {
        String body = NEW_PRODUCT.replace("Cà Phê Muối", "Cà Phê Đen").replace("39000", "27000")
                .replace("14000", "10000");
        call(PUT, "/api/v1/products/1", managerToken(), body)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(27000));
        List<AuditLog> logs = auditLogs.findByEntityTypeAndEntityIdOrderByIdAsc("PRODUCT", 1L);
        assertThat(logs).hasSize(1);
        assertThat(logs.get(0).getBeforeData()).containsEntry("price", 25000L);
        assertThat(logs.get(0).getAfterData()).containsEntry("price", 27000L);

        // Không đổi giá thì không ghi thêm
        call(PUT, "/api/v1/products/1", managerToken(), body).andExpect(status().isOk());
        assertThat(auditLogs.findByEntityTypeAndEntityIdOrderByIdAsc("PRODUCT", 1L)).hasSize(1);
    }

    @Test
    void staffTogglesAvailabilityButCannotEdit() throws Exception {
        String staff = staffToken("an", "123456");
        call(PATCH, "/api/v1/products/2/availability", staff, "{\"isAvailable\":false}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isAvailable").value(false));
        call(PUT, "/api/v1/products/2", staff, NEW_PRODUCT).andExpect(status().isForbidden());
        call(DELETE, "/api/v1/products/2", staff, null).andExpect(status().isForbidden());
    }

    @Test
    void deleteRules() throws Exception {
        String token = managerToken();
        // BR-13: món 1 nằm trong combo 1
        call(DELETE, "/api/v1/products/1", token, null)
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-13"));

        // Chưa bán, không thuộc combo nào: xoá cứng
        call(DELETE, "/api/v1/products/4", token, null).andExpect(status().isNoContent());
        flush();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM product WHERE id = 4", Integer.class)).isZero();

        // BR-14: đã bán thì chỉ xoá mềm
        jdbc.update("""
                INSERT INTO customer_order (id, code, customer_id, status, total, idempotency_key)
                VALUES (900, 'DH-260410-0900', 10, 'COMPLETED', 40000, 'k-900')""");
        jdbc.update("""
                INSERT INTO order_item (order_id, item_type, product_id, name_snapshot, unit_price, unit_cost,
                                        quantity, line_total)
                VALUES (900, 'PRODUCT', 9, 'Sữa Chua Dâu', 40000, 15000, 1, 40000)""");
        call(DELETE, "/api/v1/products/9", token, null).andExpect(status().isNoContent());
        flush();
        assertThat(jdbc.queryForObject("SELECT deleted_at IS NOT NULL FROM product WHERE id = 9", Boolean.class))
                .isTrue();
        call(GET, "/api/v1/products?categoryId=3", token, null).andExpect(jsonPath("$.length()").value(1));
    }
}
