package vn.drinkool.shop;

import java.time.Clock;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Các module khác đọc tham số P-06, P-08 → P-12 qua {@link #current()}. */
@Service
public class ShopService {

    private final ShopInfoRepository repo;
    private final Clock clock;

    public ShopService(ShopInfoRepository repo, Clock clock) {
        this.repo = repo;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public ShopInfo current() {
        return repo.findById(ShopInfo.SINGLETON_ID)
                .orElseThrow(() -> new IllegalStateException("Thiếu dòng shop_info, kiểm tra migration V2"));
    }

    @Transactional
    public ShopInfo updateInfo(ShopDtos.ShopInfoDto dto) {
        ShopInfo shop = current();
        shop.updateInfo(dto, clock.instant());
        return shop;
    }

    @Transactional
    public ShopInfo updateSettings(ShopDtos.ShopSettingsDto dto) {
        ShopInfo shop = current();
        shop.updateSettings(dto, clock.instant());
        return shop;
    }
}
