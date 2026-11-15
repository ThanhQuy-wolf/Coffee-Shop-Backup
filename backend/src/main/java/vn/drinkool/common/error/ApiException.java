package vn.drinkool.common.error;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;

/**
 * Lỗi trả về client dạng application/problem+json (docs/05-api.md §3).
 * {@code code} là mã chung như NOT_FOUND; lỗi gắn với business rule dùng {@link BusinessRuleException}.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;
    private final String title;
    private final Map<String, Object> properties = new LinkedHashMap<>();

    public ApiException(HttpStatus status, String code, String title, String detail) {
        super(detail != null ? detail : title);
        this.status = status;
        this.code = code;
        this.title = title;
    }

    public ApiException with(String key, Object value) {
        properties.put(key, value);
        return this;
    }

    public HttpStatus status() {
        return status;
    }

    public String code() {
        return code;
    }

    public String title() {
        return title;
    }

    public Map<String, Object> properties() {
        return properties;
    }

    public boolean isBusinessRule() {
        return false;
    }

    public static ApiException notFound(String what) {
        return new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy", what);
    }

    public static ApiException validation(String detail) {
        return new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION", "Dữ liệu không hợp lệ", detail);
    }

    public static ApiException unauthenticated(String detail) {
        return new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Chưa đăng nhập", detail);
    }

    public static ApiException forbidden(String detail) {
        return new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Không có quyền", detail);
    }
}
