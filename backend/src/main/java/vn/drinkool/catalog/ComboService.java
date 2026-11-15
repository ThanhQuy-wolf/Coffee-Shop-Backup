package vn.drinkool.catalog;

import java.time.Clock;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.catalog.CatalogDtos.ComboDto;
import vn.drinkool.catalog.CatalogDtos.ComboInput;
import vn.drinkool.catalog.CatalogDtos.ComboItemDto;
import vn.drinkool.catalog.CatalogDtos.ComboItemInput;
import vn.drinkool.common.audit.AuditService;
import vn.drinkool.common.error.ApiException;

/** C-10 → C-14. */
@Service
public class ComboService {

    private final ComboRepository combos;
    private final ComboItemRepository comboItems;
    private final ProductService products;
    private final CatalogSnapshot.Loader snapshots;
    private final SalesHistory history;
    private final AuditService audit;
    private final Clock clock;

    public ComboService(ComboRepository combos, ComboItemRepository comboItems, ProductService products,
                        CatalogSnapshot.Loader snapshots, SalesHistory history, AuditService audit, Clock clock) {
        this.combos = combos;
        this.comboItems = comboItems;
        this.products = products;
        this.snapshots = snapshots;
        this.history = history;
        this.audit = audit;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<ComboDto> list() {
        CatalogSnapshot s = snapshots.load();
        return combos.findByDeletedAtIsNullOrderByIdAsc().stream().map(c -> toDto(c, s)).toList();
    }

    @Transactional
    public ComboDto create(ComboInput in) {
        validate(in);
        Combo c = new Combo(clock.instant());
        apply(c, in);
        combos.save(c);
        replaceItems(c.getId(), in.items());
        return toDto(c, snapshots.load());
    }

    @Transactional
    public ComboDto update(long id, ComboInput in) {
        Combo c = find(id);
        validate(in);
        Map<String, Object> before = Map.of("price", c.getPrice());
        apply(c, in);
        audit.priceChanged("COMBO", c.getId(), before, Map.of("price", c.getPrice()));
        replaceItems(c.getId(), in.items());
        return toDto(c, snapshots.load());
    }

    @Transactional
    public ComboDto setAvailability(long id, boolean isAvailable) {
        Combo c = find(id);
        c.setAvailable(isAvailable);
        return toDto(c, snapshots.load());
    }

    /** BR-14: combo đã bán chỉ xoá mềm. Xoá cứng thì combo_item đi theo nhờ ON DELETE CASCADE. */
    @Transactional
    public void delete(long id) {
        Combo c = find(id);
        if (history.comboSold(id)) {
            c.softDelete(clock.instant());
        } else {
            comboItems.deleteAll(comboItems.findByComboIdOrderBySortOrderAscProductIdAsc(id));
            combos.delete(c);
        }
    }

    private Combo find(long id) {
        return combos.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> CatalogErrors.notFound("combo"));
    }

    /** BR-10, BR-13. */
    private void validate(ComboInput in) {
        if (in.price() <= 0) {
            throw CatalogErrors.rule("BR-10", "Giá không hợp lệ", "Giá combo phải là số nguyên lớn hơn 0");
        }
        Set<Long> seen = new HashSet<>();
        for (ComboItemInput item : in.items()) {
            if (!seen.add(item.productId())) {
                throw ApiException.validation("Một món chỉ xuất hiện một lần trong combo, hãy tăng số lượng");
            }
            products.find(item.productId());
        }
        int units = in.items().stream().mapToInt(ComboItemInput::quantity).sum();
        if (units < 2) {
            throw CatalogErrors.rule("BR-13", "Combo quá ít món",
                    "Combo phải có ít nhất 2 món, hoặc 1 món với số lượng từ 2");
        }
    }

    private void apply(Combo c, ComboInput in) {
        c.update(in.name().trim(), in.description() == null ? "" : in.description(), in.price(), in.imageUrl(),
                in.isAvailable());
    }

    // R-37: thứ tự trong `items` là thứ tự ly, quyết định số `no` khi đặt combo (A-10).
    private void replaceItems(Long comboId, List<ComboItemInput> items) {
        comboItems.deleteAll(comboItems.findByComboIdOrderBySortOrderAscProductIdAsc(comboId));
        comboItems.flush();
        for (int i = 0; i < items.size(); i++) {
            comboItems.save(new ComboItem(comboId, items.get(i).productId(), items.get(i).quantity(), i));
        }
        comboItems.flush();
    }

    private ComboDto toDto(Combo c, CatalogSnapshot s) {
        return new ComboDto(c.getId(), c.getName(), c.getDescription(), c.getPrice(), c.getImageUrl(),
                c.isAvailable(), comboItems.findByComboIdOrderBySortOrderAscProductIdAsc(c.getId()).stream()
                .map(i -> new ComboItemDto(i.getProductId(), i.getQuantity())).toList(),
                s.comboSellable(c));
    }
}
