package vn.drinkool.auth;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.auth.AuthDtos.AuthSession;
import vn.drinkool.auth.AuthDtos.OtpResponse;
import vn.drinkool.auth.AuthDtos.RegisterRequest;
import vn.drinkool.common.config.Times;
import vn.drinkool.common.error.ApiException;
import vn.drinkool.common.error.BusinessRuleException;

@Service
public class AuthService {

    /** BR-01 */
    static final Pattern VN_PHONE = Pattern.compile("^0[35789][0-9]{8}$");

    private static final SecureRandom RANDOM = new SecureRandom();

    private final AppUserRepository users;
    private final OtpVerificationRepository otps;
    private final PasswordEncoder passwords;
    private final TokenService tokens;
    private final OtpSender otpSender;
    private final AuthProperties props;
    private final Clock clock;
    private final String dummyHash;

    public AuthService(AppUserRepository users, OtpVerificationRepository otps, PasswordEncoder passwords,
                       TokenService tokens, OtpSender otpSender, AuthProperties props, Clock clock) {
        this.users = users;
        this.otps = otps;
        this.passwords = passwords;
        this.tokens = tokens;
        this.otpSender = otpSender;
        this.props = props;
        this.clock = clock;
        this.dummyHash = passwords.encode("timing-equalizer");
    }

    // noRollbackFor: lần đăng nhập sai vẫn phải lưu bộ đếm BR-04 dù request trả lỗi.
    @Transactional(noRollbackFor = ApiException.class)
    public AuthSession loginCustomer(String phone, String password) {
        return login(users.findByPhoneAndRole(phone, Role.CUSTOMER), password);
    }

    @Transactional(noRollbackFor = ApiException.class)
    public AuthSession loginStaff(String username, String password) {
        return login(users.findByUsernameAndRoleIn(username, EnumSet.of(Role.STAFF, Role.MANAGER)), password);
    }

    private AuthSession login(Optional<AppUser> account, String password) {
        Instant now = clock.instant();
        if (account.isEmpty()) {
            // Vẫn chạy bcrypt để thời gian trả lời không lộ việc tài khoản có tồn tại hay không.
            passwords.matches(password, dummyHash);
            throw wrongPassword();
        }
        AppUser user = account.get();
        if (user.isLockedAt(now)) {
            throw locked(user);
        }
        if (!passwords.matches(password, user.getPasswordHash())) {
            if (user.recordFailedLogin(props.maxFailedLogins(), now.plus(props.lockDuration()))) {
                throw locked(user);
            }
            throw wrongPassword().with("remainingAttempts", props.maxFailedLogins() - user.getFailedLoginCount());
        }
        user.recordSuccessfulLogin();
        return tokens.issue(user);
    }

    private static BusinessRuleException wrongPassword() {
        return new BusinessRuleException(HttpStatus.UNAUTHORIZED, "BR-04", "Sai thông tin đăng nhập",
                "Sai tên đăng nhập hoặc mật khẩu");
    }

    private static BusinessRuleException locked(AppUser user) {
        BusinessRuleException ex = new BusinessRuleException(HttpStatus.LOCKED, "BR-04", "Tài khoản đang tạm khoá");
        if (user.getLockedUntil() != null) {
            ex.with("lockedUntil", Times.toShopTime(user.getLockedUntil()));
        }
        return ex;
    }

    /** A-3: gửi OTP đăng ký (BR-01, BR-02). */
    @Transactional
    public OtpResponse requestOtp(String phone) {
        checkPhone(phone);
        Instant now = clock.instant();
        Optional<OtpVerification> last = otps.findFirstByPhoneAndPurposeOrderByCreatedAtDesc(phone,
                OtpVerification.PURPOSE_REGISTER);
        if (last.isPresent()) {
            Instant allowedAt = last.get().getCreatedAt().plus(props.otpResendInterval());
            if (allowedAt.isAfter(now)) {
                long wait = Math.max(1, Duration.between(now, allowedAt).toSeconds());
                throw new BusinessRuleException(HttpStatus.TOO_MANY_REQUESTS, "BR-02", "Yêu cầu OTP quá sớm",
                        "Vui lòng chờ trước khi gửi lại mã").with("retryAfter", wait);
            }
        }
        String code = props.otpFixedCode() != null && !props.otpFixedCode().isBlank()
                ? props.otpFixedCode()
                : String.format("%06d", RANDOM.nextInt(1_000_000));
        otps.save(new OtpVerification(phone, passwords.encode(code), now, now.plus(props.otpTtl())));
        otpSender.send(phone, code);
        return new OtpResponse(props.otpResendInterval().toSeconds());
    }

    /** A-4: kiểm OTP rồi tạo tài khoản Customer. */
    @Transactional(noRollbackFor = ApiException.class)
    public AuthSession register(RegisterRequest req) {
        checkPhone(req.phone());
        Instant now = clock.instant();
        OtpVerification otp = otps.findFirstByPhoneAndPurposeOrderByCreatedAtDesc(req.phone(),
                        OtpVerification.PURPOSE_REGISTER)
                .filter(o -> o.isUsableAt(now))
                .orElseThrow(() -> otpError("Mã OTP đã hết hạn, vui lòng gửi mã mới"));
        if (otp.getAttemptCount() >= props.otpMaxAttempts()) {
            throw otpError("Nhập sai quá số lần cho phép, vui lòng gửi mã mới");
        }
        if (!passwords.matches(req.otp(), otp.getCodeHash())) {
            otp.recordWrongAttempt();
            throw otpError("Mã OTP không đúng")
                    .with("remainingAttempts", props.otpMaxAttempts() - otp.getAttemptCount());
        }
        otp.consume(now);
        AppUser user = users.save(AppUser.customer(req.phone(),
                passwords.encode(req.password()), req.fullName().trim()));
        return tokens.issue(user);
    }

    private void checkPhone(String phone) {
        if (!VN_PHONE.matcher(phone).matches()) {
            throw new BusinessRuleException(HttpStatus.UNPROCESSABLE_CONTENT, "BR-01", "Số điện thoại không hợp lệ");
        }
        if (users.existsByPhone(phone)) {
            throw new BusinessRuleException(HttpStatus.UNPROCESSABLE_CONTENT, "BR-01", "Số điện thoại đã có tài khoản");
        }
    }

    private static BusinessRuleException otpError(String detail) {
        return new BusinessRuleException(HttpStatus.UNPROCESSABLE_CONTENT, "BR-02", "OTP không hợp lệ", detail);
    }

    @Transactional(readOnly = true)
    public AppUser me(long userId) {
        return users.findById(userId).orElseThrow(() -> ApiException.unauthenticated("Tài khoản không còn tồn tại"));
    }
}
