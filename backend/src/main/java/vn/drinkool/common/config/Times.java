package vn.drinkool.common.config;

import java.time.Instant;
import java.time.OffsetDateTime;

public final class Times {

    private Times() {
    }

    public static OffsetDateTime toShopTime(Instant instant) {
        return instant == null ? null : instant.atZone(ClockConfig.SHOP_ZONE).toOffsetDateTime();
    }
}
