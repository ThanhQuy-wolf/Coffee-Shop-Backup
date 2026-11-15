package vn.drinkool.order;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.persistence.EntityManager;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.catalog.CatalogSnapshot;
import vn.drinkool.catalog.Combo;
import vn.drinkool.catalog.ComboItem;
import vn.drinkool.catalog.ComboRepository;
import vn.drinkool.catalog.OptionGroup;
import vn.drinkool.catalog.OptionValue;
import vn.drinkool.catalog.Product;
import vn.drinkool.common.error.ApiException;
import vn.drinkool.common.error.BusinessRuleException;
import vn.drinkool.common.security.CurrentUser;
import vn.drinkool.order.OrderDtos.ComponentRequest;
import vn.drinkool.order.OrderDtos.CreateOrderRequest;
import vn.drinkool.order.OrderDtos.LineRequest;
import vn.drinkool.order.OrderDtos.OrderDto;
import vn.drinkool.shop.ShopInfo;
import vn.drinkool.shop.ShopService;

/** O-1. Thứ tự kiểm lỗi theo docs/05-api.md "Chi tiết của nhóm O": BR-23, BR-21, BR-18, BR-22. */
@Service
public class OrderPlacementService {

    /** Kết quả tạo đơn: {@code created} false khi gửi lại cùng Idempotency-Key (BR-24). */
    public record Placed(OrderDto order, boolean created) {
    }

    private static final SecureRandom RANDOM = new SecureRandom();

    private final OrderRepository orders;
    private final PaymentRepository payments;
    private final ComboRepository combos;
    private final CatalogSnapshot.Loader catalog;
    private final ShopService shop;
    private final OrderCodeGenerator codes;
    private final OrderViews views;
    private final Clock clock;
    private final EntityManager em;

    OrderPlacementService(OrderRepository orders, PaymentRepository payments, ComboRepository combos,
                          CatalogSnapshot.Loader catalog, ShopService shop, OrderCodeGenerator codes,
                          OrderViews views, Clock clock, EntityManager em) {
        this.orders = orders;
        this.payments = payments;
        this.combos = combos;
        this.catalog = catalog;
        this.shop = shop;
        this.codes = codes;
        this.views = views;
        this.clock = clock;
        this.em = em;
    }

    @Transactional
    public Placed place(String idempotencyKey, CreateOrderRequest req) {
        String key = checkKey(idempotencyKey);
        Long customerId = actor();
        String fingerprint = fingerprint(req, customerId);
        Optional<Placed> replay = replay(key, fingerprint);
        if (replay.isPresent()) {
            return replay.get();
        }

        ShopInfo settings = shop.current();
        List<LineRequest> lines = req.items() == null ? List.of() : req.items();
        checkQuantities(lines, settings.getMaxItemQuantity());

        Pricing pricing = new Pricing(catalog.load());
        for (int i = 0; i < lines.size(); i++) {
            pricing.price(i, lines.get(i));
        }
        pricing.throwIfInvalid();

        long total = pricing.items.stream().mapToLong(OrderItem::getLineTotal).sum();
        if (total <= 0) {
            throw new BusinessRuleException(HttpStatus.UNPROCESSABLE_CONTENT, "BR-23", "Tổng tiền phải lớn hơn 0");
        }
        // Postgres lưu tới micro giây; cắt trước để response lúc tạo khớp với lúc đọc lại
        Instant now = clock.instant().truncatedTo(ChronoUnit.MICROS);
        String guestToken = customerId == null ? newGuestToken() : null;
        CustomerOrder order = new CustomerOrder(codes.next(), customerId, guestToken, blankToNull(req.tableLabel()),
                blankToNull(req.note()), total, key, fingerprint, now, pricing.items);
        // persist thay vì save: entity mới đã có version = 1 nên Spring Data tưởng là bản cũ và merge.
        // Id IDENTITY nên INSERT chạy ngay tại persist; lỗi trùng Idempotency-Key của hai request song song
        // nổ ra ở đây và được đổi sang DataIntegrityViolationException để controller đọc lại đơn.
        try {
            em.persist(order);
        } catch (ConstraintViolationException e) {
            throw new DataIntegrityViolationException(e.getMessage(), e);
        }
        payments.save(new Payment(order.getId(), req.paymentMethod(), total));
        OrderDto dto = views.one(order, customerId);
        return new Placed(guestToken == null ? dto : dto.withGuestToken(guestToken), true);
    }

    /** Gọi sau khi {@link #place} thua cuộc đua ghi cùng Idempotency-Key với một request khác. */
    @Transactional(readOnly = true)
    public Optional<Placed> replayAfterRace(String idempotencyKey, CreateOrderRequest req) {
        return replay(checkKey(idempotencyKey), fingerprint(req, actor()));
    }

    private Optional<Placed> replay(String key, String fingerprint) {
        return orders.findByIdempotencyKey(key).map(existing -> {
            if (!existing.getRequestFingerprint().equals(fingerprint)) {
                throw new BusinessRuleException(HttpStatus.UNPROCESSABLE_CONTENT, "BR-24",
                        "Idempotency-Key đã dùng cho một đơn khác",
                        "Tạo khoá mới cho giỏ hàng này");
            }
            OrderDto dto = views.one(existing, existing.getCustomerId());
            return new Placed(existing.getGuestToken() == null ? dto : dto.withGuestToken(existing.getGuestToken()),
                    false);
        });
    }

    private static String checkKey(String key) {
        if (key == null || key.isBlank()) {
            throw ApiException.validation("Thiếu header Idempotency-Key");
        }
        if (key.length() > 64) {
            throw ApiException.validation("Idempotency-Key dài tối đa 64 ký tự");
        }
        return key;
    }

    /** Id khách đang đăng nhập, null với khách vãng lai. Nhân viên không đặt món bằng tài khoản nhân viên. */
    private static Long actor() {
        String role = CurrentUser.role().orElse(null);
        if (role != null && !role.equals("CUSTOMER")) {
            throw ApiException.forbidden("Tài khoản nhân viên không đặt món được");
        }
        return CurrentUser.id().orElse(null);
    }

    private static void checkQuantities(List<LineRequest> lines, int max) {
        if (lines.isEmpty()) {
            throw new BusinessRuleException(HttpStatus.UNPROCESSABLE_CONTENT, "BR-23", "Giỏ hàng đang trống");
        }
        List<Map<String, Object>> errors = new ArrayList<>();
        for (int i = 0; i < lines.size(); i++) {
            int q = lines.get(i).quantity();
            if (q < 1 || q > max) {
                errors.add(error(i, lines.get(i), "quantity", q, "max", max));
            }
        }
        if (!errors.isEmpty()) {
            throw OrderErrors.lines(HttpStatus.UNPROCESSABLE_CONTENT, "BR-23",
                    "Số lượng mỗi dòng phải từ 1 đến " + max, errors);
        }
    }

    /**
     * BR-24: hai request "giống nhau" khi cùng người đặt và cùng nội dung giỏ. Thứ tự id tuỳ chọn trong
     * một dòng không làm khác nội dung, nên sắp xếp trước khi băm.
     */
    static String fingerprint(CreateOrderRequest req, Long customerId) {
        StringBuilder sb = new StringBuilder();
        sb.append(customerId == null ? "G" : "C" + customerId).append('|')
                .append(req.paymentMethod()).append('|')
                .append(nullToEmpty(req.tableLabel())).append('|')
                .append(nullToEmpty(req.note())).append('|');
        for (LineRequest l : req.items() == null ? List.<LineRequest>of() : req.items()) {
            sb.append('[').append(l.type()).append(':').append(l.id()).append(':').append(l.quantity())
                    .append(':').append(l.unitPrice()).append(':').append(sorted(l.optionValueIds()));
            if (l.components() != null) {
                l.components().stream()
                        .sorted((a, b) -> Integer.compare(a.no(), b.no()))
                        .forEach(c -> sb.append('{').append(c.no()).append(':').append(sorted(c.optionValueIds()))
                                .append('}'));
            }
            sb.append(']');
        }
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(sb.toString().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static List<Long> sorted(List<Long> ids) {
        return ids == null ? List.of() : ids.stream().sorted().toList();
    }

    private static String newGuestToken() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return "gt_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.strip();
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s.strip();
    }

    private static Map<String, Object> error(int line, LineRequest l, Object... extra) {
        Map<String, Object> e = new LinkedHashMap<>();
        e.put("line", line);
        e.put("itemType", l.type().name());
        e.put("id", l.id());
        for (int i = 0; i < extra.length; i += 2) {
            if (extra[i + 1] != null) {
                e.put((String) extra[i], extra[i + 1]);
            }
        }
        return e;
    }

    /** Tính giá và chụp dữ liệu từng dòng, gom lỗi theo rule để báo một lần cho cả giỏ. */
    private final class Pricing {

        private final CatalogSnapshot snap;
        private final Map<Long, OptionValue> valueById = new HashMap<>();
        private final List<Map<String, Object>> unavailable = new ArrayList<>();
        private final List<Map<String, Object>> invalidSelection = new ArrayList<>();
        private final List<Map<String, Object>> priceChanged = new ArrayList<>();
        private final List<OrderItem> items = new ArrayList<>();

        Pricing(CatalogSnapshot snap) {
            this.snap = snap;
            snap.allValuesByGroup().values().forEach(vs -> vs.forEach(v -> valueById.put(v.getId(), v)));
        }

        void price(int line, LineRequest l) {
            if (l.type() == OrderItem.Type.PRODUCT) {
                priceProduct(line, l);
            } else {
                priceCombo(line, l);
            }
        }

        private void priceProduct(int line, LineRequest l) {
            Product p = snap.products().get(l.id());
            if (p == null || !snap.sellableProducts().contains(p.getId())) {
                unavailable.add(error(line, l, "reason", "UNAVAILABLE"));
                return;
            }
            List<Long> chosen = l.optionValueIds() == null ? List.of() : l.optionValueIds();
            Selection sel = select(line, l, null, p, chosen);
            if (sel == null) {
                return;
            }
            long unitPrice = p.getPrice() + sel.priceDelta;
            long unitCost = p.getCostPrice() + sel.costDelta;
            List<OrderItemOption> options = sel.values.stream()
                    .map(v -> option(null, null, v))
                    .toList();
            addItem(line, l, new OrderItem(OrderItem.Type.PRODUCT, p.getId(), p.getName(), p.getCategoryId(),
                    unitPrice, unitCost, l.quantity(), options));
        }

        private void priceCombo(int line, LineRequest l) {
            Optional<Combo> found = combos.findByIdAndDeletedAtIsNull(l.id());
            if (found.isEmpty() || !snap.comboSellable(found.get())) {
                unavailable.add(error(line, l, "reason", "UNAVAILABLE"));
                return;
            }
            Combo c = found.get();
            if (l.optionValueIds() != null && !l.optionValueIds().isEmpty()) {
                invalidSelection.add(error(line, l, "groupId", 0,
                        "message", "Dòng combo gửi lựa chọn theo từng ly trong components"));
                return;
            }
            // Ly thứ n theo thứ tự món của combo, món số lượng 2 chiếm hai ly liền nhau (BR-18)
            List<Product> units = new ArrayList<>();
            for (ComboItem item : snap.itemsOf(c.getId())) {
                for (int k = 0; k < item.getQuantity(); k++) {
                    units.add(snap.products().get(item.getProductId()));
                }
            }
            Map<Integer, List<Long>> byNo = new HashMap<>();
            for (ComponentRequest comp : l.components() == null ? List.<ComponentRequest>of() : l.components()) {
                if (comp.no() < 1 || comp.no() > units.size()) {
                    invalidSelection.add(error(line, l, "componentNo", comp.no(), "groupId", 0,
                            "message", "Combo chỉ có " + units.size() + " ly"));
                } else if (byNo.putIfAbsent(comp.no(),
                        comp.optionValueIds() == null ? List.of() : comp.optionValueIds()) != null) {
                    invalidSelection.add(error(line, l, "componentNo", comp.no(), "groupId", 0,
                            "message", "Ly số " + comp.no() + " bị gửi hai lần"));
                }
            }
            long priceDelta = 0;
            long cost = 0;
            boolean ok = true;
            List<OrderItemOption> options = new ArrayList<>();
            for (int n = 1; n <= units.size(); n++) {
                Product unit = units.get(n - 1);
                cost += unit.getCostPrice();
                Selection sel = select(line, l, n, unit, byNo.getOrDefault(n, List.of()));
                if (sel == null) {
                    ok = false;
                    continue;
                }
                priceDelta += sel.priceDelta;
                cost += sel.costDelta;
                for (OptionValue v : sel.values) {
                    options.add(option(n, unit, v));
                }
            }
            if (!ok) {
                return;
            }
            // BR-51: dòng combo không thuộc danh mục nào, báo cáo xếp vào nhóm "Combo"
            addItem(line, l, new OrderItem(OrderItem.Type.COMBO, c.getId(), c.getName(), null,
                    c.getPrice() + priceDelta, cost, l.quantity(), options));
        }

        private void addItem(int line, LineRequest l, OrderItem item) {
            if (item.getUnitPrice() != l.unitPrice()) {
                priceChanged.add(error(line, l, "currentPrice", item.getUnitPrice()));
            }
            items.add(item);
        }

        private record Selection(List<OptionValue> values, long priceDelta, long costDelta) {
        }

        /**
         * Kiểm lựa chọn của một món hoặc một ly trong combo. Trả null khi có lỗi (đã ghi vào danh sách lỗi).
         * Giá trị tắt bán hoặc đã xoá là BR-21, các lỗi còn lại là BR-18, giống checkSelection của frontend.
         */
        private Selection select(int line, LineRequest l, Integer componentNo, Product p, List<Long> chosen) {
            List<Long> groupIds = snap.groupIdsOf(p.getId());
            boolean failed = false;
            List<OptionValue> values = new ArrayList<>();
            boolean unknown = false;
            for (Long id : chosen) {
                OptionValue v = id == null ? null : valueById.get(id);
                if (v == null || !groupIds.contains(v.getOptionGroupId())) {
                    unknown = true;
                } else if (v.getDeletedAt() != null || !v.isAvailable()) {
                    unavailable.add(error(line, l, "componentNo", componentNo, "optionValueId", id,
                            "reason", "OPTION_UNAVAILABLE"));
                    failed = true;
                } else {
                    values.add(v);
                }
            }
            if (new HashSet<>(chosen).size() != chosen.size()) {
                selectionError(line, l, componentNo, 0L, "Một tuỳ chọn bị chọn hai lần");
                failed = true;
            }
            if (unknown) {
                selectionError(line, l, componentNo, 0L, "Có tuỳ chọn không thuộc món này");
                failed = true;
            }
            Set<Long> chosenSet = Set.copyOf(chosen.stream().filter(id -> id != null).toList());
            for (Long groupId : groupIds) {
                OptionGroup g = snap.groups().get(groupId);
                long count = snap.allValuesByGroup().getOrDefault(groupId, List.of()).stream()
                        .filter(v -> chosenSet.contains(v.getId())).count();
                if (count < g.getMinSelect()) {
                    selectionError(line, l, componentNo, groupId, g.getMinSelect() == 1
                            ? "Chưa chọn " + g.getName().toLowerCase()
                            : g.getName() + ": chọn ít nhất " + g.getMinSelect());
                    failed = true;
                } else if (count > g.getMaxSelect()) {
                    selectionError(line, l, componentNo, groupId, g.getName() + ": chọn tối đa " + g.getMaxSelect());
                    failed = true;
                }
            }
            if (failed) {
                return null;
            }
            // Thứ tự hiển thị: theo nhóm của món, rồi theo thứ tự giá trị
            List<OptionValue> ordered = values.stream()
                    .sorted((a, b) -> {
                        int ga = groupIds.indexOf(a.getOptionGroupId());
                        int gb = groupIds.indexOf(b.getOptionGroupId());
                        return ga != gb ? Integer.compare(ga, gb)
                                : a.getSortOrder() != b.getSortOrder()
                                ? Integer.compare(a.getSortOrder(), b.getSortOrder())
                                : a.getId().compareTo(b.getId());
                    })
                    .collect(Collectors.toList());
            long priceDelta = ordered.stream().mapToLong(OptionValue::getPriceDelta).sum();
            long costDelta = ordered.stream().mapToLong(OptionValue::getCostDelta).sum();
            return new Selection(ordered, priceDelta, costDelta);
        }

        private void selectionError(int line, LineRequest l, Integer componentNo, Long groupId, String message) {
            invalidSelection.add(error(line, l, "componentNo", componentNo, "groupId", groupId, "message", message));
        }

        private OrderItemOption option(Integer componentNo, Product unit, OptionValue v) {
            OptionGroup g = snap.groups().get(v.getOptionGroupId());
            return new OrderItemOption(componentNo, unit == null ? null : unit.getId(),
                    unit == null ? null : unit.getName(), g.getId(), v.getId(), g.getName(), v.getName(),
                    v.getPriceDelta(), v.getCostDelta());
        }

        void throwIfInvalid() {
            if (!unavailable.isEmpty()) {
                throw OrderErrors.lines(HttpStatus.UNPROCESSABLE_CONTENT, "BR-21", "Có món không còn bán",
                        unavailable);
            }
            if (!invalidSelection.isEmpty()) {
                throw OrderErrors.lines(HttpStatus.UNPROCESSABLE_CONTENT, "BR-18", "Lựa chọn tuỳ chọn chưa hợp lệ",
                        invalidSelection);
            }
            if (!priceChanged.isEmpty()) {
                throw OrderErrors.lines(HttpStatus.CONFLICT, "BR-22", "Giá đã thay đổi", priceChanged);
            }
        }
    }
}
