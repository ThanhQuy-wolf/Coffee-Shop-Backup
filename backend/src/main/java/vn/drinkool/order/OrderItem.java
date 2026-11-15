package vn.drinkool.order;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

/** Một dòng đơn. Tên, giá bán, giá vốn và danh mục được chụp lúc đặt (BR-14, BR-17, BR-51). */
@Entity
@Table(name = "order_item")
public class OrderItem {

    public enum Type { PRODUCT, COMBO }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private Type itemType;

    private Long productId;
    private Long comboId;
    private String nameSnapshot;
    private Long categoryIdSnapshot;
    private long unitPrice;
    private long unitCost;
    private int quantity;
    private long lineTotal;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_item_id", nullable = false)
    @OrderBy("componentNo, id")
    private List<OrderItemOption> options = new ArrayList<>();

    protected OrderItem() {
    }

    OrderItem(Type type, Long refId, String name, Long categoryId, long unitPrice, long unitCost, int quantity,
              List<OrderItemOption> options) {
        this.itemType = type;
        this.productId = type == Type.PRODUCT ? refId : null;
        this.comboId = type == Type.COMBO ? refId : null;
        this.nameSnapshot = name;
        this.categoryIdSnapshot = categoryId;
        this.unitPrice = unitPrice;
        this.unitCost = unitCost;
        this.quantity = quantity;
        this.lineTotal = unitPrice * quantity;
        this.options.addAll(options);
    }

    public Type getItemType() { return itemType; }
    public Long getRefId() { return itemType == Type.PRODUCT ? productId : comboId; }
    public String getNameSnapshot() { return nameSnapshot; }
    public long getUnitPrice() { return unitPrice; }
    public int getQuantity() { return quantity; }
    public long getLineTotal() { return lineTotal; }
    public List<OrderItemOption> getOptions() { return options; }
}
