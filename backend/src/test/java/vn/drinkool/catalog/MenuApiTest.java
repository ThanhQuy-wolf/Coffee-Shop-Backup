package vn.drinkool.catalog;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import vn.drinkool.IntegrationTest;

class MenuApiTest extends IntegrationTest {

    @Autowired
    JdbcTemplate jdbc;

    @Test
    void menuShowsOnlyWhatIsOnSale() throws Exception {
        mvc.perform(get("/api/v1/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categories.length()").value(6))
                .andExpect(jsonPath("$.products.length()").value(15))
                .andExpect(jsonPath("$.products[0].optionGroupIds[0]").value(1))
                .andExpect(jsonPath("$.products[0].costPrice").doesNotExist())
                // Combo 3 đang tắt bán
                .andExpect(jsonPath("$.combos[*].id", not(hasItem(3))))
                .andExpect(jsonPath("$.combos.length()").value(2))
                .andExpect(jsonPath("$.optionGroups.length()").value(4))
                .andExpect(jsonPath("$.optionGroups[3].values[0].costDelta").doesNotExist());
    }

    @Test
    void turningOffProductHidesCombosContainingIt() throws Exception {
        jdbc.update("UPDATE product SET is_available = false WHERE id = 1");
        mvc.perform(get("/api/v1/menu"))
                .andExpect(jsonPath("$.products[*].id", not(hasItem(1))))
                .andExpect(jsonPath("$.combos[*].id", not(hasItem(1))))
                .andExpect(jsonPath("$.combos[*].id", hasItem(2)));
    }

    @Test
    void requiredGroupWithoutValuesOnSaleHidesProducts() throws Exception {
        // BR-19: hết cả Size M và Size L thì mọi món có nhóm Size coi như tạm hết
        jdbc.update("UPDATE option_value SET is_available = false WHERE option_group_id = 1");
        mvc.perform(get("/api/v1/menu"))
                .andExpect(jsonPath("$.products[*].id", everyItem(org.hamcrest.Matchers.oneOf(8, 9, 14, 15))))
                .andExpect(jsonPath("$.combos.length()").value(0));
    }

    @Test
    void optionalValueOutOfStockStaysVisibleAsUnavailable() throws Exception {
        jdbc.update("UPDATE option_value SET is_available = false WHERE id = 11");
        mvc.perform(get("/api/v1/menu"))
                .andExpect(jsonPath("$.products.length()").value(15))
                .andExpect(jsonPath("$.optionGroups[3].values[0].id").value(11))
                .andExpect(jsonPath("$.optionGroups[3].values[0].isAvailable").value(false));
    }

    @Test
    void searchMatchesNameAndDescription() throws Exception {
        mvc.perform(get("/api/v1/menu").param("q", "matcha"))
                .andExpect(jsonPath("$.products.length()").value(1))
                .andExpect(jsonPath("$.products[0].id").value(6))
                .andExpect(jsonPath("$.combos[0].id").value(2));
    }
}
