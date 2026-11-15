package vn.drinkool.common.security;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import tools.jackson.databind.json.JsonMapper;
import vn.drinkool.common.error.ApiException;
import vn.drinkool.common.error.Problems;

/** Lỗi 401/403 sinh ở filter security không đi qua ProblemHandler, nên tự ghi problem+json ở đây. */
@Component
public class ProblemAuthHandlers implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final JsonMapper json;

    public ProblemAuthHandlers(JsonMapper json) {
        this.json = json;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException ex)
            throws IOException {
        write(response, ApiException.unauthenticated("Thiếu hoặc hết hạn access token"));
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException ex)
            throws IOException {
        write(response, ApiException.forbidden("Tài khoản không có quyền thực hiện thao tác này"));
    }

    private void write(HttpServletResponse response, ApiException ex) throws IOException {
        response.setStatus(ex.status().value());
        response.setContentType(Problems.PROBLEM_JSON.toString());
        response.setCharacterEncoding("UTF-8");
        json.writeValue(response.getOutputStream(), Problems.body(ex));
    }
}
