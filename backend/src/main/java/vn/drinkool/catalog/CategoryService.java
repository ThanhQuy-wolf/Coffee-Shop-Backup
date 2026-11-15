package vn.drinkool.catalog;

import java.time.Clock;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.catalog.CatalogDtos.CategoryDto;
import vn.drinkool.catalog.CatalogDtos.CategoryInput;
import vn.drinkool.common.error.ApiException;

/** C-1 → C-4. */
@Service
public class CategoryService {

    private final CategoryRepository categories;
    private final ProductRepository products;
    private final Clock clock;

    public CategoryService(CategoryRepository categories, ProductRepository products, Clock clock) {
        this.categories = categories;
        this.products = products;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> list() {
        return categories.findByDeletedAtIsNullOrderBySortOrderAscIdAsc().stream().map(this::toDto).toList();
    }

    @Transactional
    public CategoryDto create(CategoryInput in) {
        String name = checkName(in.name(), null);
        return toDto(categories.save(new Category(name, in.icon().trim(), in.sortOrder(), clock.instant())));
    }

    @Transactional
    public CategoryDto update(long id, CategoryInput in) {
        Category c = find(id);
        c.update(checkName(in.name(), id), in.icon().trim(), in.sortOrder());
        return toDto(c);
    }

    /** BR-11: chỉ xoá được danh mục rỗng, và chỉ xoá mềm vì món đã xoá mềm vẫn trỏ tới nó. */
    @Transactional
    public void delete(long id) {
        Category c = find(id);
        long count = products.countByCategoryIdAndDeletedAtIsNull(id);
        if (count > 0) {
            throw CatalogErrors.rule("BR-11", "Danh mục còn món",
                    "Danh mục còn " + count + " món, hãy chuyển món sang danh mục khác trước");
        }
        c.softDelete(clock.instant());
    }

    Category find(long id) {
        return categories.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> CatalogErrors.notFound("danh mục"));
    }

    // R-40: chưa có BR cho tên danh mục, nhưng DDL có unique index nên kiểm trước để trả lỗi dễ hiểu.
    private String checkName(String raw, Long selfId) {
        String name = raw.trim();
        if (categories.nameTaken(name, selfId)) {
            throw ApiException.validation("Tên danh mục đã tồn tại");
        }
        return name;
    }

    private CategoryDto toDto(Category c) {
        return new CategoryDto(c.getId(), c.getName(), c.getIcon(), c.getSortOrder(),
                products.countByCategoryIdAndDeletedAtIsNull(c.getId()));
    }
}
