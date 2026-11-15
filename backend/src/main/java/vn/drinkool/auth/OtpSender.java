package vn.drinkool.auth;

/** Cổng gửi SMS. Chưa chọn nhà cung cấp, nên hiện chỉ có {@link LogOtpSender}. */
public interface OtpSender {

    void send(String phone, String code);
}
