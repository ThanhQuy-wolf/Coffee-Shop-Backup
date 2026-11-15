package vn.drinkool.catalog;

import static org.springframework.http.HttpMethod.DELETE;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.HttpMethod.PUT;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;

import vn.drinkool.IntegrationTest;

class CategoryApiTest extends IntegrationTest {

    @Test
    void staffListsCategoriesWithProductCount() throws Exception {
        call(GET, "/api/v1/categories", staffToken("an", "123456"), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6))
                .andExpect(jsonPath("$[0].name").value("Cà Phê"))
                .andExpect(jsonPath("$[0].productCount").value(4));
        call(GET, "/api/v1/categories", null, null).andExpect(status().isUnauthorized());
    }

    @Test
    void managerCreatesUpdatesAndDeletesEmptyCategory() throws Exception {
        String token = managerToken();
        String id = json.readTree(call(POST, "/api/v1/categories", token,
                        "{\"name\":\"Sinh tố\",\"icon\":\"blender\",\"sortOrder\":7}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productCount").value(0))
                .andReturn().getResponse().getContentAsString()).get("id").asString();
        call(PUT, "/api/v1/categories/" + id, token, "{\"name\":\"Sinh Tố\",\"icon\":\"blender\",\"sortOrder\":8}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sortOrder").value(8));
        call(DELETE, "/api/v1/categories/" + id, token, null).andExpect(status().isNoContent());
        call(DELETE, "/api/v1/categories/" + id, token, null).andExpect(status().isNotFound());
    }

    @Test
    void categoryWithProductsCannotBeDeleted() throws Exception {
        call(DELETE, "/api/v1/categories/1", managerToken(), null)
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-11"));
    }

    @Test
    void duplicateNameAndStaffWriteAreRejected() throws Exception {
        call(POST, "/api/v1/categories", managerToken(), "{\"name\":\"cà phê\",\"icon\":\"x\",\"sortOrder\":1}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION"));
        call(POST, "/api/v1/categories", staffToken("an", "123456"), "{\"name\":\"Mới\",\"icon\":\"x\",\"sortOrder\":1}")
                .andExpect(status().isForbidden());
    }
}
