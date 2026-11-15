package vn.drinkool.common.error;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class ProblemHandler {

    private static final Logger log = LoggerFactory.getLogger(ProblemHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApi(ApiException ex) {
        ResponseEntity<Map<String, Object>> response = Problems.response(ex);
        // BR-02: client cần header Retry-After để đếm ngược nút "Gửi lại mã"
        Object retryAfter = ex.properties().get("retryAfter");
        if (retryAfter != null) {
            return ResponseEntity.status(response.getStatusCode())
                    .headers(response.getHeaders())
                    .header(HttpHeaders.RETRY_AFTER, retryAfter.toString())
                    .body(response.getBody());
        }
        return response;
    }

    /** BR-27: lưới an toàn khi một lệnh ghi thua cuộc đua version mà controller chưa tự bắt. */
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<Map<String, Object>> handleOptimisticLock(ObjectOptimisticLockingFailureException ex) {
        return Problems.response(new BusinessRuleException(HttpStatus.CONFLICT, "BR-27",
                "Dữ liệu vừa được người khác cập nhật", "Tải lại rồi thao tác lại"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidBody(MethodArgumentNotValidException ex) {
        List<Map<String, Object>> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> Map.<String, Object>of("field", e.getField(),
                        "message", e.getDefaultMessage() == null ? "không hợp lệ" : e.getDefaultMessage()))
                .toList();
        return Problems.response(ApiException.validation("Có " + errors.size() + " trường không hợp lệ").with("errors", errors));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class, MissingRequestHeaderException.class})
    public ResponseEntity<Map<String, Object>> handleBadRequest(Exception ex) {
        return Problems.response(ApiException.validation("Request không đúng định dạng"));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMediaType(HttpMediaTypeNotSupportedException ex) {
        return Problems.response(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "VALIDATION", "Content-Type không được hỗ trợ", null);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResource(NoResourceFoundException ex) {
        return Problems.response(ApiException.notFound("Không có đường dẫn này"));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethod(HttpRequestMethodNotSupportedException ex) {
        return Problems.response(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", "Không hỗ trợ method này", null);
    }

    // Lỗi phân quyền ném từ trong controller/service sẽ tới đây trước ExceptionTranslationFilter,
    // nên phải bắt riêng, nếu không handler Exception bên dưới biến nó thành 500.
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return Problems.response(ApiException.forbidden("Tài khoản không có quyền thực hiện thao tác này"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex) {
        String traceId = UUID.randomUUID().toString();
        log.error("Unhandled error traceId={}", traceId, ex);
        return Problems.response(new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL", "Lỗi hệ thống", null)
                .with("traceId", traceId));
    }
}
