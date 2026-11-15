package vn.drinkool.catalog;

import java.time.Clock;
import java.time.Instant;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.catalog.CatalogDtos.OptionGroupDto;
import vn.drinkool.catalog.CatalogDtos.OptionGroupInput;
import vn.drinkool.catalog.CatalogDtos.OptionValueDto;
import vn.drinkool.catalog.CatalogDtos.OptionValueInput;
import vn.drinkool.catalog.OptionGroup.SelectionType;
import vn.drinkool.common.audit.AuditService;

/** C-15 → C-19. */
@Service
public class OptionGroupService {

    private final OptionGroupRepository groups;
    private final OptionValueRepository values;
    private final ProductOptionGroupRepository productGroups;
    private final SalesHistory history;
    private final AuditService audit;
    private final Clock clock;

    public OptionGroupService(OptionGroupRepository groups, OptionValueRepository values,
                              ProductOptionGroupRepository productGroups, SalesHistory history, AuditService audit,
                              Clock clock) {
        this.groups = groups;
        this.values = values;
        this.productGroups = productGroups;
        this.history = history;
        this.audit = audit;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<OptionGroupDto> list() {
        return groups.findByDeletedAtIsNullOrderBySortOrderAscIdAsc().stream()
                .map(g -> toDto(g, productGroups.countLiveProductsUsing(g.getId())))
                .toList();
    }

    @Transactional
    public OptionGroupDto create(OptionGroupInput in) {
        validate(in, null);
        OptionGroup g = new OptionGroup(clock.instant());
        g.update(in.name().trim(), in.selectionType(), in.minSelect(), in.maxSelect(), in.sortOrder());
        groups.save(g);
        for (int i = 0; i < in.values().size(); i++) {
            OptionValueInput v = in.values().get(i);
            OptionValue row = new OptionValue(g.getId());
            row.update(v.name().trim(), v.priceDelta(), v.costDelta(), v.isDefault(), i);
            values.save(row);
        }
        return toDto(g, 0L);
    }

    /** Giá trị có id thì sửa, không có thì thêm, thiếu thì xoá (mềm nếu đã bán, BR-19). */
    @Transactional
    public OptionGroupDto update(long id, OptionGroupInput in) {
        OptionGroup g = find(id);
        validate(in, id);
        Instant now = clock.instant();
        Map<Long, OptionValue> current = new HashMap<>();
        values.findByOptionGroupIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(id).forEach(v -> current.put(v.getId(), v));

        Set<Long> kept = new HashSet<>();
        for (OptionValueInput v : in.values()) {
            if (v.id() != null) {
                if (!current.containsKey(v.id())) {
                    throw CatalogErrors.notFound("giá trị " + v.id() + " trong nhóm này");
                }
                kept.add(v.id());
            }
        }
        for (OptionValue old : current.values()) {
            if (!kept.contains(old.getId())) {
                if (history.optionValueSold(old.getId())) {
                    old.softDelete(now);
                } else {
                    values.delete(old);
                }
            }
        }
        // Xoá trước rồi mới thêm, để giá trị mới được trùng tên giá trị vừa bỏ (uq_option_value_name).
        values.flush();

        g.update(in.name().trim(), in.selectionType(), in.minSelect(), in.maxSelect(), in.sortOrder());
        for (int i = 0; i < in.values().size(); i++) {
            OptionValueInput v = in.values().get(i);
            OptionValue row = v.id() == null ? new OptionValue(id) : current.get(v.id());
            Map<String, Object> before = row.getId() == null ? null : prices(row);
            row.update(v.name().trim(), v.priceDelta(), v.costDelta(), v.isDefault(), i);
            values.save(row);
            if (before != null) {
                audit.priceChanged("OPTION_VALUE", row.getId(), before, prices(row));
            }
        }
        values.flush();
        return toDto(g, productGroups.countLiveProductsUsing(id));
    }

    /** BR-19: nhóm còn gắn vào món chưa xoá thì phải gỡ trước. R-39: còn dữ liệu trỏ tới thì xoá mềm. */
    @Transactional
    public void delete(long id) {
        OptionGroup g = find(id);
        long used = productGroups.countLiveProductsUsing(id);
        if (used > 0) {
            throw CatalogErrors.rule("BR-19", "Nhóm đang được dùng",
                    "Nhóm đang gắn vào " + used + " món, hãy gỡ khỏi món trước");
        }
        if (history.optionGroupReferenced(id)) {
            Instant now = clock.instant();
            g.softDelete(now);
            values.findByOptionGroupIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(id).forEach(v -> v.softDelete(now));
        } else {
            values.deleteAll(values.findByOptionGroupId(id));
            values.flush();
            groups.delete(g);
        }
    }

    @Transactional
    public OptionValueDto setValueAvailability(long valueId, boolean isAvailable) {
        OptionValue v = values.findByIdAndDeletedAtIsNull(valueId)
                .filter(x -> groups.findByIdAndDeletedAtIsNull(x.getOptionGroupId()).isPresent())
                .orElseThrow(() -> CatalogErrors.notFound("tuỳ chọn"));
        v.setAvailable(isAvailable);
        return OptionValueDto.of(v);
    }

    private OptionGroup find(long id) {
        return groups.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> CatalogErrors.notFound("nhóm tuỳ chọn"));
    }

    /** BR-16, BR-17. */
    private void validate(OptionGroupInput in, Long selfId) {
        if (groups.nameTaken(in.name().trim(), selfId)) {
            throw CatalogErrors.conflict("BR-16", "Trùng tên nhóm", "Tên nhóm tuỳ chọn đã tồn tại");
        }
        List<OptionValueInput> vs = in.values();
        if (vs.isEmpty()) {
            throw CatalogErrors.rule("BR-16", "Nhóm không hợp lệ", "Nhóm phải có ít nhất 1 giá trị");
        }
        Set<String> names = new HashSet<>();
        for (OptionValueInput v : vs) {
            if (!names.add(v.name().trim().toLowerCase(Locale.ROOT))) {
                throw CatalogErrors.conflict("BR-16", "Trùng tên giá trị", "Hai giá trị trong nhóm trùng tên");
            }
            if (v.priceDelta() < 0 || v.costDelta() < 0) {
                throw CatalogErrors.rule("BR-17", "Giá chênh không hợp lệ",
                        "Giá chênh và giá vốn chênh phải là số nguyên không âm");
            }
        }
        int min = in.minSelect();
        int max = in.maxSelect();
        if (min < 0 || max < 1 || min > max) {
            throw groupRule("Số lựa chọn tối thiểu phải từ 0 và không lớn hơn tối đa");
        }
        if (in.selectionType() == SelectionType.SINGLE && max != 1) {
            throw groupRule("Nhóm chọn một chỉ cho chọn tối đa 1");
        }
        if (max > vs.size()) {
            throw groupRule("Số lựa chọn tối đa vượt số giá trị của nhóm");
        }
        long defaults = vs.stream().filter(OptionValueInput::isDefault).count();
        if (in.selectionType() == SelectionType.MULTIPLE && defaults > 0) {
            throw groupRule("Nhóm chọn nhiều không có giá trị mặc định");
        }
        if (in.selectionType() == SelectionType.SINGLE && defaults > 1) {
            throw groupRule("Nhóm chọn một chỉ có tối đa 1 giá trị mặc định");
        }
        if (in.selectionType() == SelectionType.SINGLE && min == 1 && defaults != 1) {
            throw groupRule("Nhóm bắt buộc chọn một phải có đúng 1 giá trị mặc định");
        }
    }

    private static RuntimeException groupRule(String detail) {
        return CatalogErrors.rule("BR-16", "Nhóm không hợp lệ", detail);
    }

    private static Map<String, Object> prices(OptionValue v) {
        return Map.of("priceDelta", v.getPriceDelta(), "costDelta", v.getCostDelta());
    }

    private OptionGroupDto toDto(OptionGroup g, Long productCount) {
        return new OptionGroupDto(g.getId(), g.getName(), g.getSelectionType(), g.getMinSelect(), g.getMaxSelect(),
                g.getSortOrder(), values.findByOptionGroupIdAndDeletedAtIsNullOrderBySortOrderAscIdAsc(g.getId())
                .stream().map(OptionValueDto::of).toList(), productCount);
    }
}
