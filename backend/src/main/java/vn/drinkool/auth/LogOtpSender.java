package vn.drinkool.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** Ghi OTP ra log thay cho SMS. Khi có nhà cung cấp SMS thì thay bean này. */
@Component
public class LogOtpSender implements OtpSender {

    private static final Logger log = LoggerFactory.getLogger(LogOtpSender.class);

    @Override
    public void send(String phone, String code) {
        log.info("OTP cho số ***{}: {}", phone.substring(phone.length() - 3), code);
    }
}
