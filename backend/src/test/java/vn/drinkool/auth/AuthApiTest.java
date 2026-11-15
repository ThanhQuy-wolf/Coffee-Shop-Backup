package vn.drinkool.auth;

import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import tools.jackson.databind.JsonNode;
import vn.drinkool.IntegrationTest;

class AuthApiTest extends IntegrationTest {

    private ResultActions send(String path, String body) throws Exception {
        return mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(body));
    }

    @Test
    void staffLoginReturnsSessionWithRole() throws Exception {
        send("/api/v1/auth/staff/login", "{\"username\":\"an\",\"password\":\"123456\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value(notNullValue()))
                .andExpect(jsonPath("$.refreshToken").value(startsWith("rt_")))
                .andExpect(jsonPath("$.expiresIn").value(900))
                .andExpect(jsonPath("$.user.role").value("STAFF"))
                .andExpect(jsonPath("$.user.departmentId").value(1));
    }

    @Test
    void customerLoginKeepsLegacyPath() throws Exception {
        send("/api/customer/login", "{\"phone\":\"0987654321\",\"password\":\"user1\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.user.phone").value("0987654321"));
    }

    @Test
    void customerCannotLogInAsStaff() throws Exception {
        send("/api/v1/auth/staff/login", "{\"username\":\"0987654321\",\"password\":\"user1\"}")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.rule").value("BR-04"));
    }

    @Test
    void wrongPasswordCountsDownThenLocksAccount() throws Exception {
        String wrong = "{\"username\":\"binh\",\"password\":\"sai\"}";
        for (int remaining = 4; remaining >= 1; remaining--) {
            send("/api/v1/auth/staff/login", wrong)
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                    .andExpect(jsonPath("$.rule").value("BR-04"))
                    .andExpect(jsonPath("$.remainingAttempts").value(remaining));
        }
        send("/api/v1/auth/staff/login", wrong)
                .andExpect(status().isLocked())
                .andExpect(jsonPath("$.rule").value("BR-04"))
                .andExpect(jsonPath("$.lockedUntil").value(notNullValue()));
        // Đang khoá thì mật khẩu đúng cũng bị từ chối
        send("/api/v1/auth/staff/login", "{\"username\":\"binh\",\"password\":\"123456\"}")
                .andExpect(status().isLocked());
    }

    @Test
    void meRequiresToken() throws Exception {
        mvc.perform(get("/api/v1/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer khong-phai-jwt"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
        mvc.perform(get("/api/v1/me").header("Authorization", bearer(managerToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("MANAGER"));
    }

    @Test
    void refreshRotatesTokenAndRejectsReuse() throws Exception {
        JsonNode session = postJson("/api/v1/auth/staff/login", "{\"username\":\"cuong\",\"password\":\"123456\"}");
        String oldRefresh = session.get("refreshToken").asString();

        JsonNode renewed = postJson("/api/v1/auth/refresh", "{\"refreshToken\":\"" + oldRefresh + "\"}");
        String newRefresh = renewed.get("refreshToken").asString();

        send("/api/v1/auth/refresh", "{\"refreshToken\":\"" + oldRefresh + "\"}")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
        // Dùng lại token cũ bị coi là lộ token: mọi phiên của người đó bị thu hồi, kể cả token mới
        send("/api/v1/auth/refresh", "{\"refreshToken\":\"" + newRefresh + "\"}")
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logoutRevokesRefreshToken() throws Exception {
        JsonNode session = postJson("/api/v1/auth/staff/login", "{\"username\":\"an\",\"password\":\"123456\"}");
        String refresh = session.get("refreshToken").asString();
        mvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", bearer(session.get("accessToken").asString()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + refresh + "\"}"))
                .andExpect(status().isNoContent());
        send("/api/v1/auth/refresh", "{\"refreshToken\":\"" + refresh + "\"}")
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registerWithOtpCreatesCustomer() throws Exception {
        send("/api/v1/auth/otp/request", "{\"phone\":\"0912345678\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resendAfter").value(60));
        send("/api/v1/auth/register",
                "{\"phone\":\"0912345678\",\"otp\":\"123456\",\"password\":\"matkhau1\",\"fullName\":\"Ngô Lan\"}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.user.fullName").value("Ngô Lan"));
        send("/api/customer/login", "{\"phone\":\"0912345678\",\"password\":\"matkhau1\"}")
                .andExpect(status().isOk());
        // OTP đã dùng rồi thì không dùng lại được, và số đã có tài khoản thì không xin OTP được nữa
        send("/api/v1/auth/otp/request", "{\"phone\":\"0912345678\"}")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-01"));
    }

    @Test
    void otpRules() throws Exception {
        send("/api/v1/auth/otp/request", "{\"phone\":\"0212345678\"}")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-01"));
        send("/api/v1/auth/otp/request", "{\"phone\":\"0987654321\"}")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-01"));

        send("/api/v1/auth/otp/request", "{\"phone\":\"0356789012\"}").andExpect(status().isOk());
        send("/api/v1/auth/otp/request", "{\"phone\":\"0356789012\"}")
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.rule").value("BR-02"));

        send("/api/v1/auth/register",
                "{\"phone\":\"0356789012\",\"otp\":\"000000\",\"password\":\"matkhau1\",\"fullName\":\"A\"}")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.rule").value("BR-02"))
                .andExpect(jsonPath("$.remainingAttempts").value(4));
    }

    @Test
    void invalidBodyReturnsValidationProblem() throws Exception {
        send("/api/v1/auth/register", "{\"phone\":\"0356789012\",\"otp\":\"12\",\"password\":\"1\",\"fullName\":\"\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION"))
                .andExpect(jsonPath("$.errors.length()").value(3));
        send("/api/v1/auth/staff/login", "không phải json")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION"));
    }
}
