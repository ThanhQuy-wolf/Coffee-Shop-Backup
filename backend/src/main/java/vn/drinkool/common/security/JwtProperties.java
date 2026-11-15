package vn.drinkool.common.security;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param secret khoá HMAC-SHA256, tối thiểu 32 byte
 * @param accessTtl thời hạn access token (docs/05-api.md: 15 phút)
 * @param refreshTtl thời hạn refresh token (30 ngày)
 */
@ConfigurationProperties("drinkool.jwt")
public record JwtProperties(String secret, Duration accessTtl, Duration refreshTtl) {
}
