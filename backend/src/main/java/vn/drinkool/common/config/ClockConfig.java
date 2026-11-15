package vn.drinkool.common.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ClockConfig {

    /** NFR-06: mọi mốc giờ trả về cho client theo múi Asia/Ho_Chi_Minh. */
    public static final ZoneId SHOP_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    // Inject Clock thay vì gọi Instant.now() để test chỉnh được giờ (khoá đăng nhập, hạn OTP, job huỷ đơn).
    @Bean
    public Clock clock() {
        return Clock.system(SHOP_ZONE);
    }
}
