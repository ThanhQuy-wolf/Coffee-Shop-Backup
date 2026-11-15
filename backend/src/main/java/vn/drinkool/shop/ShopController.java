package vn.drinkool.shop;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.drinkool.shop.ShopDtos.ShopInfoDto;
import vn.drinkool.shop.ShopDtos.ShopSettingsDto;

/** S-2 → S-5. Quyền Manager cho PUT và /settings được khai báo trong SecurityConfig. */
@RestController
@RequestMapping("/api/v1/shop")
public class ShopController {

    private final ShopService shops;

    public ShopController(ShopService shops) {
        this.shops = shops;
    }

    @GetMapping
    public ShopInfoDto get() {
        return ShopInfoDto.of(shops.current());
    }

    @PutMapping
    public ShopInfoDto update(@Valid @RequestBody ShopInfoDto dto) {
        return ShopInfoDto.of(shops.updateInfo(dto));
    }

    @GetMapping("/settings")
    public ShopSettingsDto getSettings() {
        return ShopSettingsDto.of(shops.current());
    }

    @PutMapping("/settings")
    public ShopSettingsDto updateSettings(@Valid @RequestBody ShopSettingsDto dto) {
        return ShopSettingsDto.of(shops.updateSettings(dto));
    }
}
