package vn.drinkool.catalog;

import java.time.Clock;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.catalog.CatalogDtos.ProductDto;
import vn.drinkool.catalog.CatalogDtos.ProductInput;
import vn.drinkool.common.audit.AuditService;
import vn.drinkool.common.error.ApiException;

/** C-5 → C-9. */
@Service
public class ProductService {

    private final ProductRepository products;
    private final ProductOptionGroupRepository productGroups;
    private final OptionGroupRepository groups;
    private final ComboItemRepository comboItems;
    private final CategoryService categories;
    private final SalesHistory history;
    private final AuditService audit;
    private final Clock clock;

    public ProductService(ProductRepository products, ProductOptionGroupRepository productGroups,
                          OptionGroupRepository groups, ComboItemRepository comboItems,
                          CategoryService categories, SalesHistory history, AuditService audit, Clock clock) {
        this.products = products;
        this.productGroups = productGroups;
        this.groups = groups;
        this.comboItems = comboItems;
        this.categories = categories;
        this.history = history;
        this.audit = audit;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> list(Long categoryId) {
        List<Product> rows = categoryId == null
                ? products.findByDeletedAtIsNullOrderByIdAsc()
                : products.findByDeletedAtIsNullAndCategoryIdOrderByIdAsc(categoryId);
        return rows.stream().map(this::toDto).toList();
    }

    @Transactional
    public ProductDto create(ProductInput in) {
        String name = validate(in, null);
        Product p = new Product(clock.instant());
        apply(p, name, in);
        products.save(p);
        replaceGroups(p.getId(), in.optionGroupIds());
        return toDto(p);
    }

    @Transactional
    public ProductDto update(long id, ProductInput in) {
        Product p = find(id);
        String name = validate(in, id);
        Map<String, Object> before = prices(p);
        apply(p, name, in);
        audit.priceChanged("PRODUCT", p.getId(), before, prices(p));
        replaceGroups(p.getId(), in.optionGroupIds());
        return toDto(p);
    }

    @Transactional
    public ProductDto setAvailability(long id, boolean isAvailable) {
        Product p = find(id);
        p.setAvailable(isAvailable, clock.instant());
        return toDto(p);
    }

    /** BR-14, R-38. Món còn trong combo chưa xoá thì phải gỡ khỏi combo trước (BR-13). */
    @Transactional
    public void delete(long id) {
        Product p = find(id);
        if (comboItems.usedByLiveCombo(id)) {
            throw CatalogErrors.rule("BR-13", "Món đang nằm trong combo",
                    "Món đang nằm trong combo, hãy gỡ khỏi combo trước");
        }
        if (history.productReferenced(id)) {
            p.softDelete(clock.instant());
        } else {
            products.delete(p);
        }
    }

    Product find(long id) {
        return products.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> CatalogErrors.notFound("món"));
    }

    private String validate(ProductInput in, Long selfId) {
        if (in.price() <= 0) {
            throw CatalogErrors.rule("BR-10", "Giá không hợp lệ", "Giá bán phải là số nguyên lớn hơn 0");
        }
        if (in.costPrice() < 0) {
            throw CatalogErrors.rule("BR-10", "Giá không hợp lệ", "Giá vốn phải là số nguyên không âm");
        }
        categories.find(in.categoryId());
        List<Long> groupIds = in.optionGroupIds() == null ? List.of() : in.optionGroupIds();
        if (new HashSet<>(groupIds).size() != groupIds.size()) {
            throw ApiException.validation("Một nhóm tuỳ chọn bị gắn hai lần");
        }
        for (Long g : groupIds) {
            groups.findByIdAndDeletedAtIsNull(g).orElseThrow(() -> CatalogErrors.notFound("nhóm tuỳ chọn " + g));
        }
        String name = in.name().trim();
        if (products.nameTaken(name, selfId)) {
            throw CatalogErrors.conflict("BR-12", "Trùng tên món", "Tên món đã tồn tại");
        }
        return name;
    }

    private void apply(Product p, String name, ProductInput in) {
        p.update(in.categoryId(), name, in.description() == null ? "" : in.description(), in.price(),
                in.costPrice(), in.imageUrl(), in.isAvailable(), clock.instant());
    }

    // Xoá rồi chèn lại toàn bộ: thứ tự trong mảng là thứ tự hiển thị. Flush giữa hai bước vì Hibernate
    // mặc định chạy INSERT trước DELETE, sẽ đụng khoá chính khi giữ lại cùng một nhóm.
    private void replaceGroups(Long productId, List<Long> groupIds) {
        productGroups.deleteAll(productGroups.findByProductIdOrderBySortOrderAsc(productId));
        productGroups.flush();
        List<Long> ids = groupIds == null ? List.of() : groupIds;
        for (int i = 0; i < ids.size(); i++) {
            productGroups.save(new ProductOptionGroup(productId, ids.get(i), i));
        }
    }

    private static Map<String, Object> prices(Product p) {
        return Map.of("price", p.getPrice(), "costPrice", p.getCostPrice());
    }

    ProductDto toDto(Product p) {
        return new ProductDto(p.getId(), p.getCategoryId(), p.getName(), p.getDescription(), p.getPrice(),
                p.getCostPrice(), p.getImageUrl(), p.isAvailable(),
                productGroups.findByProductIdOrderBySortOrderAsc(p.getId()).stream()
                        .map(ProductOptionGroup::getOptionGroupId).toList());
    }
}
