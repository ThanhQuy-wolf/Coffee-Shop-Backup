package vn.drinkool.shop;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import vn.drinkool.IntegrationTest;

class ShopApiTest extends IntegrationTest {

    private static final String INFO = """
            {"name":"Drinkool Q3","tagline":"","address":"86 Cao Thắng","phone":"0901234567",
             "email":"a@drinkool.vn","logoUrl":"","coverImageUrl":"","openHours":"07:00 – 22:00",
             "wifiName":"Drinkool","wifiPassword":"12345678","socialLinks":{"facebook":"https://fb.com/x"}}
            """;

    @Test
    void anyoneCanReadShopInfo() throws Exception {
        mvc.perform(get("/api/v1/shop"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Drinkool Coffee"))
                .andExpect(jsonPath("$.socialLinks.tiktok").value("https://tiktok.com/@drinkool"));
    }

    @Test
    void onlyManagerUpdatesShopInfo() throws Exception {
        mvc.perform(put("/api/v1/shop").contentType(MediaType.APPLICATION_JSON).content(INFO))
                .andExpect(status().isUnauthorized());
        mvc.perform(put("/api/v1/shop").header("Authorization", bearer(staffToken("an", "123456")))
                        .contentType(MediaType.APPLICATION_JSON).content(INFO))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mvc.perform(put("/api/v1/shop").header("Authorization", bearer(managerToken()))
                        .contentType(MediaType.APPLICATION_JSON).content(INFO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Drinkool Q3"));
        mvc.perform(get("/api/v1/shop")).andExpect(jsonPath("$.socialLinks.facebook").value("https://fb.com/x"));
    }

    @Test
    void emptyShopNameIsRejected() throws Exception {
        mvc.perform(put("/api/v1/shop").header("Authorization", bearer(managerToken()))
                        .contentType(MediaType.APPLICATION_JSON).content(INFO.replace("Drinkool Q3", " ")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("name"));
    }

    @Test
    void managerReadsAndUpdatesSettings() throws Exception {
        String token = managerToken();
        mvc.perform(get("/api/v1/shop/settings").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentTimeoutMinutes").value(15))
                .andExpect(jsonPath("$.shiftBookingDays").value(14));
        String body = """
                {"paymentTimeoutMinutes":10,"maxItemQuantity":30,"reviewWindowDays":5,
                 "shiftCancelHours":6,"attendanceEditDays":2,"shiftBookingDays":7}""";
        mvc.perform(put("/api/v1/shop/settings").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentTimeoutMinutes").value(10));
        mvc.perform(put("/api/v1/shop/settings").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(body.replace("10", "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION"));
        mvc.perform(get("/api/v1/shop/settings").header("Authorization", bearer(staffToken("an", "123456"))))
                .andExpect(status().isForbidden());
    }
}
