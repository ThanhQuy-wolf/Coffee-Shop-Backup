package vn.drinkool.common.error;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/** Dựng body problem+json theo RFC 9457 với trường mở rộng {@code rule} hoặc {@code code}. */
public final class Problems {

    public static final MediaType PROBLEM_JSON = MediaType.APPLICATION_PROBLEM_JSON;
    private static final String TYPE_BASE = "https://drinkool.vn/problems/";

    private Problems() {
    }

    public static Map<String, Object> body(ApiException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("type", TYPE_BASE + (ex.isBusinessRule() ? "business-rule" : ex.code().toLowerCase().replace('_', '-')));
        body.put("title", ex.title());
        body.put("status", ex.status().value());
        body.put(ex.isBusinessRule() ? "rule" : "code", ex.code());
        if (ex.getMessage() != null && !ex.getMessage().equals(ex.title())) {
            body.put("detail", ex.getMessage());
        }
        body.putAll(ex.properties());
        return body;
    }

    public static ResponseEntity<Map<String, Object>> response(ApiException ex) {
        return ResponseEntity.status(ex.status()).contentType(PROBLEM_JSON).body(body(ex));
    }

    public static ResponseEntity<Map<String, Object>> response(HttpStatus status, String code, String title, String detail) {
        return response(new ApiException(status, code, title, detail));
    }
}
