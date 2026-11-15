package vn.drinkool.shop;

import java.time.Instant;
import java.util.Map;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Dòng duy nhất của shop_info (A-5): thông tin quán và tham số P-06, P-08 → P-12. */
@Entity
@Table(name = "shop_info")
public class ShopInfo {

    public static final short SINGLETON_ID = 1;

    @Id
    private Short id;

    private String name;
    private String tagline;
    private String address;
    private String phone;
    private String email;
    private String logoUrl;
    private String coverImageUrl;
    private String openHours;
    private String wifiName;
    private String wifiPassword;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> socialLinks;

    private int paymentTimeoutMinutes;
    private int maxItemQuantity;
    private int reviewWindowDays;
    private int shiftCancelHours;
    private int attendanceEditDays;
    private int shiftBookingDays;
    private Instant updatedAt;

    protected ShopInfo() {
    }

    public void updateInfo(ShopDtos.ShopInfoDto d, Instant now) {
        name = d.name().trim();
        tagline = d.tagline();
        address = d.address().trim();
        phone = d.phone();
        email = d.email();
        logoUrl = d.logoUrl();
        coverImageUrl = d.coverImageUrl();
        openHours = d.openHours();
        wifiName = d.wifiName();
        wifiPassword = d.wifiPassword();
        socialLinks = d.socialLinks() == null ? Map.of() : d.socialLinks();
        updatedAt = now;
    }

    public void updateSettings(ShopDtos.ShopSettingsDto s, Instant now) {
        paymentTimeoutMinutes = s.paymentTimeoutMinutes();
        maxItemQuantity = s.maxItemQuantity();
        reviewWindowDays = s.reviewWindowDays();
        shiftCancelHours = s.shiftCancelHours();
        attendanceEditDays = s.attendanceEditDays();
        shiftBookingDays = s.shiftBookingDays();
        updatedAt = now;
    }

    public String getName() { return name; }
    public String getTagline() { return tagline; }
    public String getAddress() { return address; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getLogoUrl() { return logoUrl; }
    public String getCoverImageUrl() { return coverImageUrl; }
    public String getOpenHours() { return openHours; }
    public String getWifiName() { return wifiName; }
    public String getWifiPassword() { return wifiPassword; }
    public Map<String, String> getSocialLinks() { return socialLinks; }
    public int getPaymentTimeoutMinutes() { return paymentTimeoutMinutes; }
    public int getMaxItemQuantity() { return maxItemQuantity; }
    public int getReviewWindowDays() { return reviewWindowDays; }
    public int getShiftCancelHours() { return shiftCancelHours; }
    public int getAttendanceEditDays() { return attendanceEditDays; }
    public int getShiftBookingDays() { return shiftBookingDays; }
}
