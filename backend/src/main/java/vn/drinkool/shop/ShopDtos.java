package vn.drinkool.shop;

import java.util.Map;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class ShopDtos {

    private ShopDtos() {
    }

    public record ShopInfoDto(
            @NotBlank(message = "Tên quán không được để trống") @Size(max = 120) String name,
            @Size(max = 200) String tagline,
            @NotBlank(message = "Địa chỉ không được để trống") @Size(max = 255) String address,
            @Size(max = 15) String phone,
            @Email @Size(max = 120) String email,
            @Size(max = 500) String logoUrl,
            @Size(max = 500) String coverImageUrl,
            @Size(max = 100) String openHours,
            @Size(max = 64) String wifiName,
            @Size(max = 64) String wifiPassword,
            Map<String, String> socialLinks) {

        static ShopInfoDto of(ShopInfo s) {
            return new ShopInfoDto(s.getName(), s.getTagline(), s.getAddress(), s.getPhone(), s.getEmail(),
                    s.getLogoUrl(), s.getCoverImageUrl(), s.getOpenHours(), s.getWifiName(), s.getWifiPassword(),
                    s.getSocialLinks() == null ? Map.of() : s.getSocialLinks());
        }
    }

    /** Giới hạn khớp CHECK trong 04-erd: thời hạn thanh toán, số lượng và số ngày đặt ca phải lớn hơn 0. */
    public record ShopSettingsDto(
            @Min(1) @Max(1440) int paymentTimeoutMinutes,
            @Min(1) @Max(999) int maxItemQuantity,
            @Min(0) @Max(365) int reviewWindowDays,
            @Min(0) @Max(720) int shiftCancelHours,
            @Min(0) @Max(365) int attendanceEditDays,
            @Min(1) @Max(365) int shiftBookingDays) {

        static ShopSettingsDto of(ShopInfo s) {
            return new ShopSettingsDto(s.getPaymentTimeoutMinutes(), s.getMaxItemQuantity(), s.getReviewWindowDays(),
                    s.getShiftCancelHours(), s.getAttendanceEditDays(), s.getShiftBookingDays());
        }
    }
}
