package vn.drinkool;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.persistence.EntityManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Chạy cả ứng dụng trên Postgres thật (Testcontainers) với dữ liệu demo của profile dev.
 * Mỗi test chạy trong một transaction và được rollback, nên các test không ảnh hưởng nhau.
 */
@SpringBootTest(properties = "drinkool.jobs.enabled=false")
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Import(TestcontainersConfig.class)
@Transactional
public abstract class IntegrationTest {

    @Autowired
    protected MockMvc mvc;

    @Autowired
    protected JsonMapper json;

    @Autowired
    protected EntityManager em;

    /** Đẩy thay đổi còn trong persistence context xuống DB trước khi kiểm bằng SQL thuần. */
    protected void flush() {
        em.flush();
    }

    protected JsonNode postJson(String path, String body) throws Exception {
        String res = mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().is2xxSuccessful())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(res);
    }

    protected String staffToken(String username, String password) throws Exception {
        return postJson("/api/v1/auth/staff/login",
                "{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}")
                .get("accessToken").asString();
    }

    protected String managerToken() throws Exception {
        return staffToken("admin", "admin");
    }

    /** Gửi request JSON kèm token; {@code token} hoặc {@code body} null thì bỏ qua. */
    protected ResultActions call(HttpMethod method, String path, String token, String body) throws Exception {
        MockHttpServletRequestBuilder req = request(method, path);
        if (token != null) {
            req.header("Authorization", bearer(token));
        }
        if (body != null) {
            req.contentType(MediaType.APPLICATION_JSON).content(body);
        }
        return mvc.perform(req);
    }

    protected static String bearer(String token) {
        return "Bearer " + token;
    }
}
