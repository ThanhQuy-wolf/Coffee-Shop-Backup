package vn.drinkool.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record UserDto(Long id, Role role, String fullName, String phone, String username,
                          String avatarUrl, Long departmentId) {

        public static UserDto of(AppUser u) {
            return new UserDto(u.getId(), u.getRole(), u.getFullName(), u.getPhone(), u.getUsername(),
                    u.getAvatarUrl(), u.getDepartmentId());
        }
    }

    public record AuthSession(String accessToken, String refreshToken, long expiresIn, UserDto user) {
    }

    public record CustomerLoginRequest(@NotBlank String phone, @NotBlank String password) {
    }

    public record StaffLoginRequest(@NotBlank String username, @NotBlank String password) {
    }

    // Không gắn @Pattern ở đây: số sai định dạng phải trả 422 BR-01 chứ không phải 400 VALIDATION.
    public record OtpRequest(@NotBlank String phone) {
    }

    public record OtpResponse(long resendAfter) {
    }

    public record RegisterRequest(
            @NotBlank String phone,
            @NotBlank @Pattern(regexp = "\\d{6}", message = "OTP gồm 6 chữ số") String otp,
            @NotBlank @Size(min = 6, max = 72, message = "Mật khẩu dài 6 đến 72 ký tự") String password,
            @NotBlank @Size(max = 120) String fullName) {
    }

    public record RefreshRequest(@NotBlank String refreshToken) {
    }

    public record LogoutRequest(String refreshToken) {
    }
}
