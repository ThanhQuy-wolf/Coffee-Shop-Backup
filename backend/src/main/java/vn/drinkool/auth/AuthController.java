package vn.drinkool.auth;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import vn.drinkool.auth.AuthDtos.AuthSession;
import vn.drinkool.auth.AuthDtos.CustomerLoginRequest;
import vn.drinkool.auth.AuthDtos.LogoutRequest;
import vn.drinkool.auth.AuthDtos.OtpRequest;
import vn.drinkool.auth.AuthDtos.OtpResponse;
import vn.drinkool.auth.AuthDtos.RefreshRequest;
import vn.drinkool.auth.AuthDtos.RegisterRequest;
import vn.drinkool.auth.AuthDtos.StaffLoginRequest;
import vn.drinkool.auth.AuthDtos.UserDto;
import vn.drinkool.common.security.CurrentUser;

/** A-1 → A-7 trong docs/05-api.md §2.1. */
@RestController
public class AuthController {

    private final AuthService auth;
    private final TokenService tokens;

    public AuthController(AuthService auth, TokenService tokens) {
        this.auth = auth;
        this.tokens = tokens;
    }

    // A-1 giữ đường dẫn cũ không có /v1 vì frontend đang gọi nó.
    @PostMapping("/api/customer/login")
    public AuthSession loginCustomer(@Valid @RequestBody CustomerLoginRequest req) {
        return auth.loginCustomer(req.phone(), req.password());
    }

    @PostMapping("/api/v1/auth/staff/login")
    public AuthSession loginStaff(@Valid @RequestBody StaffLoginRequest req) {
        return auth.loginStaff(req.username(), req.password());
    }

    @PostMapping("/api/v1/auth/otp/request")
    public OtpResponse requestOtp(@Valid @RequestBody OtpRequest req) {
        return auth.requestOtp(req.phone());
    }

    @PostMapping("/api/v1/auth/register")
    public ResponseEntity<AuthSession> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(201).body(auth.register(req));
    }

    @PostMapping("/api/v1/auth/refresh")
    public AuthSession refresh(@Valid @RequestBody RefreshRequest req) {
        return tokens.refresh(req.refreshToken());
    }

    @PostMapping("/api/v1/auth/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) LogoutRequest req) {
        tokens.revoke(CurrentUser.requireId(), req == null ? null : req.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/me")
    public UserDto me() {
        return UserDto.of(auth.me(CurrentUser.requireId()));
    }
}
