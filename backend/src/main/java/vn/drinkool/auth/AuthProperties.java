package vn.drinkool.auth;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Tham số vận hành của xác thực (docs/02 §2), nằm trong cấu hình backend chứ không ở shop_info.
 *
 * @param otpResendInterval P-01
 * @param otpMaxAttempts P-02
 * @param otpTtl P-03
 * @param maxFailedLogins P-04
 * @param lockDuration P-05
 * @param otpFixedCode chỉ dùng ở dev/test khi chưa có cổng SMS: mọi OTP đều là mã này
 */
@ConfigurationProperties("drinkool.auth")
public record AuthProperties(
        Duration otpResendInterval,
        int otpMaxAttempts,
        Duration otpTtl,
        int maxFailedLogins,
        Duration lockDuration,
        String otpFixedCode) {
}
