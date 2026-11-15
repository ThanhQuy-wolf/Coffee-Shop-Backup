package vn.drinkool.catalog;

import java.util.List;

/**
 * Response của S-6. Menu công khai không trả giá vốn ({@code costPrice}, {@code costDelta}):
 * đó là số liệu nội bộ, chỉ có ở các API quản lý C-5, C-15.
 */
public final class MenuDtos {

    private MenuDtos() {
    }

    public record Menu(List<CategoryDto> categories, List<ProductDto> products, List<ComboDto> combos,
                       List<OptionGroupDto> optionGroups) {
    }

    public record CategoryDto(Long id, String name, String icon, int sortOrder) {
    }

    public record ProductDto(Long id, Long categoryId, String name, String description, long price,
                             String imageUrl, boolean isAvailable, List<Long> optionGroupIds) {
    }

    public record ComboItemDto(Long productId, int quantity) {
    }

    public record ComboDto(Long id, String name, String description, long price, String imageUrl,
                           boolean isAvailable, List<ComboItemDto> items, boolean sellable) {
    }

    public record OptionValueDto(Long id, String name, long priceDelta, boolean isDefault, boolean isAvailable,
                                 int sortOrder) {
    }

    public record OptionGroupDto(Long id, String name, OptionGroup.SelectionType selectionType, int minSelect,
                                 int maxSelect, int sortOrder, List<OptionValueDto> values) {
    }
}
