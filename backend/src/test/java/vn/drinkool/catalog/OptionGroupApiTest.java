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

class OptionGroupApiTest extends IntegrationTest {

    private static final String SWEETNESS = """
            {"name":"Độ ngọt","selectionType":"SINGLE","minSelect":1,"maxSelect":1,"sortOrder":5,
             "values":[{"name":"Ngọt","priceDelta":0,"costDelta":0,"isDefault":true},
                       {"name":"Ít ngọt","priceDelta":0,"costDelta":0,"isDefault":false}]}""";

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    AuditLogRepository auditLogs;

    @Test
    void listIncludesCostDeltaAndProductCount() throws Exception {
        call(GET, "/api/v1/option-groups", staffToken("an", "123456"), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Size"))
                .andExpect(jsonPath("$[0].productCount").value(11))
                .andExpect(jsonPath("$[0].values[1].costDelta").value(2500));
    }

    @Test
    void createAndDeleteUnusedGroup() throws Exception {
        String token = managerToken();
        String id = json.readTree(call(POST, "/api/v1/option-groups", token, SWEETNESS)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.values.length()").value(2))
                .andExpect(jsonPath("$.values[0].isAvailable").value(true))
                .andReturn().getResponse().getContentAsString()).get("id").asString();
        call(DELETE, "/api/v1/option-groups/" + id, token, null).andExpect(status().isNoContent());
        flush();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM option_group WHERE id = " + id, Integer.class))
                .isZero();
    }

    @Test
    void groupRules() throws Exception {
        String token = managerToken();
        call(POST, "/api/v1/option-groups", token, SWEETNESS.replace("Độ ngọt", "size"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.rule").value("BR-16"));
        call(POST, "/api/v1/option-groups", token, SWEETNESS.replace("\"Ít ngọt\"", "\"ngọt\""))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.rule").value("BR-16"));
        call(POST, "/api/v1/option-groups", token, SWEETNESS.replace("\"isDefault\":true", "\"isDefault\":false"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-16"));
        call(POST, "/api/v1/option-groups", token, SWEETNESS.replace("\"maxSelect\":1", "\"maxSelect\":2"))
                .andExpect(jsonPath("$.rule").value("BR-16"));
        call(POST, "/api/v1/option-groups", token, SWEETNESS.replace("\"priceDelta\":0,\"costDelta\":0,\"isDefault\":false",
                        "\"priceDelta\":-1000,\"costDelta\":0,\"isDefault\":false"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-17"));
        call(POST, "/api/v1/option-groups", token, SWEETNESS.replace("\"SINGLE\"", "\"MULTIPLE\""))
                .andExpect(jsonPath("$.rule").value("BR-16"));
    }

    @Test
    void groupInUseCannotBeDeleted() throws Exception {
        call(DELETE, "/api/v1/option-groups/1", managerToken(), null)
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-19"));
    }

    @Test
    void updateEditsAddsAndRemovesValues() throws Exception {
        // Size: sửa giá L, bỏ M (chưa bán, nên xoá cứng), thêm S làm mặc định
        String body = """
                {"name":"Size","selectionType":"SINGLE","minSelect":1,"maxSelect":1,"sortOrder":1,
                 "values":[{"name":"Size S","priceDelta":0,"costDelta":0,"isDefault":true},
                           {"id":2,"name":"Size L","priceDelta":7000,"costDelta":2500,"isDefault":false}]}""";
        call(PUT, "/api/v1/option-groups/1", managerToken(), body)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.values.length()").value(2))
                .andExpect(jsonPath("$.values[0].name").value("Size S"))
                .andExpect(jsonPath("$.values[1].id").value(2))
                .andExpect(jsonPath("$.values[1].priceDelta").value(7000));
        flush();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM option_value WHERE id = 1", Integer.class)).isZero();
        assertThat(auditLogs.findByEntityTypeAndEntityIdOrderByIdAsc("OPTION_VALUE", 2L)).hasSize(1);
    }

    @Test
    void staffTogglesValueAndMenuReflectsIt() throws Exception {
        call(PATCH, "/api/v1/option-values/12/availability", staffToken("binh", "123456"), "{\"isAvailable\":false}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isAvailable").value(false));
        call(GET, "/api/v1/menu", null, null).andExpect(jsonPath("$.optionGroups[3].values[1].isAvailable").value(false));
        call(PATCH, "/api/v1/option-values/999/availability", managerToken(), "{\"isAvailable\":false}")
                .andExpect(status().isNotFound());
    }
}
