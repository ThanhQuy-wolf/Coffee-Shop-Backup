package vn.drinkool.catalog;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MenuController {

    private final MenuService menu;

    public MenuController(MenuService menu) {
        this.menu = menu;
    }

    @GetMapping("/api/v1/menu")
    public MenuDtos.Menu menu(@RequestParam(required = false) String q) {
        return menu.menu(q);
    }
}
