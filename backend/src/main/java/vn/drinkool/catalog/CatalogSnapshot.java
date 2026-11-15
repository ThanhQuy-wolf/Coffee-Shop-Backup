package vn.drinkool.catalog;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

/**
 * Ảnh chụp các món, nhóm tuỳ chọn, combo còn sống, dùng để tính tình trạng bán (BR-13, BR-19).
 * Một quán chỉ có vài chục món, nên đọc hết rồi tính trong bộ nhớ thay vì viết truy vấn SQL cho từng rule.
 */
public record CatalogSnapshot(
        Map<Long, Product> products,
        Map<Long, OptionGroup> groups,
        Map<Long, List<OptionValue>> valuesByGroup,
        Map<Long, List<OptionValue>> allValuesByGroup,
        Map<Long, List<Long>> groupIdsByProduct,
        Map<Long, List<ComboItem>> itemsByCombo,
        Set<Long> sellableProducts) {

    public List<Long> groupIdsOf(Long productId) {
        return groupIdsByProduct.getOrDefault(productId, List.of());
    }

    public List<ComboItem> itemsOf(Long comboId) {
        return itemsByCombo.getOrDefault(comboId, List.of());
    }

    /** BR-13: combo bán được khi chính nó bật bán và mọi món thành phần đang bán được. */
    public boolean comboSellable(Combo c) {
        List<ComboItem> items = itemsOf(c.getId());
        return c.isAvailable() && c.getDeletedAt() == null && !items.isEmpty()
                && items.stream().allMatch(i -> sellableProducts.contains(i.getProductId()));
    }

    @Component
    public static class Loader {

        private final ProductRepository products;
        private final ComboItemRepository comboItems;
        private final OptionGroupRepository groups;
        private final OptionValueRepository values;
        private final ProductOptionGroupRepository productGroups;

        Loader(ProductRepository products, ComboItemRepository comboItems, OptionGroupRepository groups,
               OptionValueRepository values, ProductOptionGroupRepository productGroups) {
            this.products = products;
            this.comboItems = comboItems;
            this.groups = groups;
            this.values = values;
            this.productGroups = productGroups;
        }

        /** Gọi trong một transaction. */
        public CatalogSnapshot load() {
            Map<Long, OptionGroup> liveGroups = groups.findByDeletedAtIsNullOrderBySortOrderAscIdAsc().stream()
                    .collect(Collectors.toMap(OptionGroup::getId, Function.identity(), (a, b) -> a,
                            LinkedHashMap::new));
            Map<Long, List<OptionValue>> valuesByGroup = values.findByDeletedAtIsNullOrderBySortOrderAscIdAsc()
                    .stream()
                    .filter(v -> liveGroups.containsKey(v.getOptionGroupId()))
                    .collect(Collectors.groupingBy(OptionValue::getOptionGroupId));
            // Giữ cả giá trị đã xoá để giỏ cũ chọn giá trị vừa bị xoá nhận BR-21, không phải BR-18.
            Map<Long, List<OptionValue>> allValuesByGroup = values.findAll().stream()
                    .filter(v -> liveGroups.containsKey(v.getOptionGroupId()))
                    .sorted(Comparator.comparingInt(OptionValue::getSortOrder).thenComparing(OptionValue::getId))
                    .collect(Collectors.groupingBy(OptionValue::getOptionGroupId));
            Map<Long, List<Long>> groupIdsByProduct = productGroups.findAll().stream()
                    .filter(pg -> liveGroups.containsKey(pg.getOptionGroupId()))
                    .sorted(Comparator.comparingInt(ProductOptionGroup::getSortOrder))
                    .collect(Collectors.groupingBy(ProductOptionGroup::getProductId,
                            Collectors.mapping(ProductOptionGroup::getOptionGroupId, Collectors.toList())));
            Map<Long, Product> liveProducts = products.findByDeletedAtIsNullOrderByIdAsc().stream()
                    .collect(Collectors.toMap(Product::getId, Function.identity(), (a, b) -> a,
                            LinkedHashMap::new));
            Map<Long, List<ComboItem>> itemsByCombo = comboItems.findAll().stream()
                    .sorted(Comparator.comparingInt(ComboItem::getSortOrder).thenComparing(ComboItem::getProductId))
                    .collect(Collectors.groupingBy(ComboItem::getComboId));
            Set<Long> sellable = liveProducts.values().stream()
                    .filter(p -> isSellable(p, groupIdsByProduct, liveGroups, valuesByGroup))
                    .map(Product::getId)
                    .collect(Collectors.toSet());
            return new CatalogSnapshot(liveProducts, liveGroups, valuesByGroup, allValuesByGroup, groupIdsByProduct,
                    itemsByCombo,
                    sellable);
        }

        /** BR-13, BR-19: món bật bán và mọi nhóm bắt buộc còn đủ {@code min_select} giá trị đang bán. */
        private static boolean isSellable(Product p, Map<Long, List<Long>> groupIdsByProduct,
                                          Map<Long, OptionGroup> liveGroups,
                                          Map<Long, List<OptionValue>> valuesByGroup) {
            if (!p.isAvailable()) {
                return false;
            }
            for (Long groupId : groupIdsByProduct.getOrDefault(p.getId(), List.of())) {
                OptionGroup g = liveGroups.get(groupId);
                long onSale = valuesByGroup.getOrDefault(groupId, List.of()).stream()
                        .filter(OptionValue::isAvailable).count();
                if (g.getMinSelect() > 0 && onSale < g.getMinSelect()) {
                    return false;
                }
            }
            return true;
        }
    }
}
