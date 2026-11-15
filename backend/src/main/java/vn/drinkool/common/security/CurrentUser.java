package vn.drinkool.common.security;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import vn.drinkool.common.error.ApiException;

public final class CurrentUser {

    private CurrentUser() {
    }

    /** Id người đang đăng nhập, rỗng với khách vãng lai. */
    public static Optional<Long> id() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwt) {
            return Optional.of(Long.valueOf(jwt.getToken().getSubject()));
        }
        return Optional.empty();
    }

    /** Role trong JWT (CUSTOMER, STAFF, MANAGER), rỗng với khách vãng lai. */
    public static Optional<String> role() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwt) {
            return Optional.ofNullable(jwt.getToken().getClaimAsString("role"));
        }
        return Optional.empty();
    }

    public static long requireId() {
        return id().orElseThrow(() -> ApiException.unauthenticated("Cần đăng nhập"));
    }
}
