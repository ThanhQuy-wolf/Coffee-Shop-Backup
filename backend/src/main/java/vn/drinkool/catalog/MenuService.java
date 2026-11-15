package vn.drinkool.catalog;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.catalog.MenuDtos.CategoryDto;
import vn.drinkool.catalog.MenuDtos.ComboDto;
import vn.drinkool.catalog.MenuDtos.ComboItemDto;
import vn.drinkool.catalog.MenuDtos.Menu;
import vn.drinkool.catalog.MenuDtos.OptionGroupDto;
import vn.drinkool.catalog.MenuDtos.OptionValueDto;
import vn.drinkool.catalog.MenuDtos.ProductDto;

/** S-6. */
@Service
public class MenuService {

    private final CategoryRepository categories;
    private final ComboRepository combos;
    private final CatalogSnapshot.Loader snapshots;

    public MenuService(CategoryRepository categories, ComboRepository combos, CatalogSnapshot.Loader snapshots) {
        this.categories = categories;
        this.combos = combos;
        this.snapshots = snapshots;
    }

    @Transactional(readOnly = true)
    public Menu menu(String q) {
        String query = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        CatalogSnapshot s = snapshots.load();

        List<ProductDto> productDtos = s.products().values().stream()
                .filter(p -> s.sellableProducts().contains(p.getId()))
                .filter(p -> matches(query, p.getName(), p.getDescription()))
                .map(p -> new ProductDto(p.getId(), p.getCategoryId(), p.getName(), p.getDescription(), p.getPrice(),
                        p.getImageUrl(), p.isAvailable(), s.groupIdsOf(p.getId())))
                .toList();

        List<ComboDto> comboDtos = combos.findByDeletedAtIsNullOrderByIdAsc().stream()
                .filter(s::comboSellable)
                .filter(c -> matches(query, c.getName(), c.getDescription()))
                .map(c -> new ComboDto(c.getId(), c.getName(), c.getDescription(), c.getPrice(), c.getImageUrl(),
                        c.isAvailable(), s.itemsOf(c.getId()).stream()
                        .map(i -> new ComboItemDto(i.getProductId(), i.getQuantity())).toList(), true))
                .toList();

        Set<Long> usedGroupIds = new LinkedHashSet<>();
        productDtos.forEach(p -> usedGroupIds.addAll(p.optionGroupIds()));
        comboDtos.forEach(c -> c.items().forEach(i -> usedGroupIds.addAll(s.groupIdsOf(i.productId()))));
        List<OptionGroupDto> groupDtos = s.groups().values().stream()
                .filter(g -> usedGroupIds.contains(g.getId()))
                .map(g -> new OptionGroupDto(g.getId(), g.getName(), g.getSelectionType(), g.getMinSelect(),
                        g.getMaxSelect(), g.getSortOrder(), s.valuesByGroup().getOrDefault(g.getId(), List.of())
                        .stream()
                        .map(v -> new OptionValueDto(v.getId(), v.getName(), v.getPriceDelta(), v.isDefault(),
                                v.isAvailable(), v.getSortOrder()))
                        .toList()))
                .toList();

        List<CategoryDto> categoryDtos = categories.findByDeletedAtIsNullOrderBySortOrderAscIdAsc().stream()
                .map(c -> new CategoryDto(c.getId(), c.getName(), c.getIcon(), c.getSortOrder()))
                .toList();

        return new Menu(categoryDtos, productDtos, comboDtos, groupDtos);
    }

    private static boolean matches(String query, String name, String description) {
        return query.isEmpty()
                || name.toLowerCase(Locale.ROOT).contains(query)
                || (description != null && description.toLowerCase(Locale.ROOT).contains(query));
    }
}
