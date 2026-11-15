package vn.drinkool.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.auth.AuthDtos.AuthSession;
import vn.drinkool.auth.AuthDtos.UserDto;
import vn.drinkool.common.error.ApiException;
import vn.drinkool.common.security.JwtProperties;

@Service
public class TokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final JwtEncoder encoder;
    private final JwtProperties props;
    private final RefreshTokenRepository refreshTokens;
    private final AppUserRepository users;
    private final Clock clock;

    public TokenService(JwtEncoder encoder, JwtProperties props, RefreshTokenRepository refreshTokens,
                        AppUserRepository users, Clock clock) {
        this.encoder = encoder;
        this.props = props;
        this.refreshTokens = refreshTokens;
        this.users = users;
        this.clock = clock;
    }

    @Transactional
    public AuthSession issue(AppUser user) {
        Instant now = clock.instant();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(user.getId().toString())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiresAt(now.plus(props.accessTtl()))
                .build();
        String accessToken = encoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();

        byte[] raw = new byte[32];
        RANDOM.nextBytes(raw);
        String refreshToken = "rt_" + Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        refreshTokens.save(new RefreshToken(user.getId(), hash(refreshToken), now.plus(props.refreshTtl())));

        return new AuthSession(accessToken, refreshToken, props.accessTtl().toSeconds(), UserDto.of(user));
    }

    /** A-5: đổi refresh token lấy cặp token mới, token cũ bị thu hồi. */
    @Transactional(noRollbackFor = ApiException.class)
    public AuthSession refresh(String refreshToken) {
        Instant now = clock.instant();
        RefreshToken stored = refreshTokens.findByTokenHash(hash(refreshToken))
                .orElseThrow(() -> ApiException.unauthenticated("Phiên đăng nhập đã hết hạn"));
        if (stored.getRevokedAt() != null) {
            // Token đã đổi rồi mà còn bị dùng lại: có thể đã lộ, nên thu hồi mọi phiên của người này.
            refreshTokens.revokeAllOf(stored.getUserId(), now);
            throw ApiException.unauthenticated("Phiên đăng nhập đã hết hạn");
        }
        if (!stored.isActiveAt(now)) {
            throw ApiException.unauthenticated("Phiên đăng nhập đã hết hạn");
        }
        AppUser user = users.findById(stored.getUserId())
                .orElseThrow(() -> ApiException.unauthenticated("Phiên đăng nhập đã hết hạn"));
        if (user.isLockedAt(now)) {
            throw ApiException.unauthenticated("Tài khoản đang bị khoá");
        }
        stored.revoke(now);
        return issue(user);
    }

    /** A-6. Không gửi refresh token thì thu hồi mọi phiên của người dùng. */
    @Transactional
    public void revoke(long userId, String refreshToken) {
        Instant now = clock.instant();
        if (refreshToken == null || refreshToken.isBlank()) {
            refreshTokens.revokeAllOf(userId, now);
            return;
        }
        refreshTokens.findByTokenHash(hash(refreshToken))
                .filter(t -> t.getUserId().equals(userId))
                .ifPresent(t -> t.revoke(now));
    }

    // Refresh token đủ ngẫu nhiên (256 bit) nên SHA-256 là đủ, không cần bcrypt; nhờ vậy tra được theo unique index.
    static String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
