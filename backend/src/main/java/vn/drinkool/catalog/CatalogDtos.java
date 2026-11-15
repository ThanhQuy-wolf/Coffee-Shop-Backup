package vn.drinkool.catalog;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request và response của C-1 → C-19. Khác S-6, các API này trả cả giá vốn và món đang tắt bán.
 * Giá để kiểu {@code Long} để thiếu trường thì báo 400; giá ≤ 0 hay âm được kiểm ở service và trả BR-10/BR-17.
 */
public final class CatalogDtos {

    private CatalogDtos() {
    }

    public record CategoryInput(
            @NotBlank(message = "Tên danh mục không được để trống") @Size(max = 80) String name,
            @NotBlank @Size(max = 64) String icon,
            int sortOrder) {
    }

    public record CategoryDto(Long id, String name, String icon, int sortOrder, long productCount) {
    }

    public record ProductInput(
            @NotNull Long categoryId,
            @NotBlank(message = "Tên món không được để trống") @Size(max = 120) String name,
            String description,
            @NotNull Long price,
            @NotNull Long costPrice,
            @Size(max = 500) String imageUrl,
            boolean isAvailable,
            List<@NotNull Long> optionGroupIds) {
    }

    public record ProductDto(Long id, Long categoryId, String name, String description, long price, long costPrice,
                             String imageUrl, boolean isAvailable, List<Long> optionGroupIds) {
    }

    public record AvailabilityRequest(@NotNull Boolean isAvailable) {
    }

    public record ComboItemInput(@NotNull Long productId, @Min(1) int quantity) {
    }

    public record ComboInput(
            @NotBlank(message = "Tên combo không được để trống") @Size(max = 120) String name,
            String description,
            @NotNull Long price,
            @Size(max = 500) String imageUrl,
            boolean isAvailable,
            @NotNull List<@Valid @NotNull ComboItemInput> items) {
    }

    public record ComboItemDto(Long productId, int quantity) {
    }

    public record ComboDto(Long id, String name, String description, long price, String imageUrl,
                           boolean isAvailable, List<ComboItemDto> items, boolean sellable) {
    }

    public record OptionValueInput(
            Long id,
            @NotBlank(message = "Tên giá trị không được để trống") @Size(max = 60) String name,
            @NotNull Long priceDelta,
            @NotNull Long costDelta,
            boolean isDefault) {
    }

    public record OptionGroupInput(
            @NotBlank(message = "Tên nhóm không được để trống") @Size(max = 60) String name,
            @NotNull OptionGroup.SelectionType selectionType,
            int minSelect,
            int maxSelect,
            int sortOrder,
            @NotNull List<@Valid @NotNull OptionValueInput> values) {
    }

    public record OptionValueDto(Long id, String name, long priceDelta, long costDelta, boolean isDefault,
                                 boolean isAvailable, int sortOrder) {

        static OptionValueDto of(OptionValue v) {
            return new OptionValueDto(v.getId(), v.getName(), v.getPriceDelta(), v.getCostDelta(), v.isDefault(),
                    v.isAvailable(), v.getSortOrder());
        }
    }

    public record OptionGroupDto(Long id, String name, OptionGroup.SelectionType selectionType, int minSelect,
                                 int maxSelect, int sortOrder, List<OptionValueDto> values, Long productCount) {
    }
}
