package vn.drinkool.catalog;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "combo_item")
@IdClass(ComboItem.Key.class)
public class ComboItem {

    public record Key(Long comboId, Long productId) implements Serializable {
        public Key() {
            this(null, null);
        }
    }

    @Id
    private Long comboId;

    @Id
    private Long productId;

    private int quantity;
    private int sortOrder;

    protected ComboItem() {
    }

    public ComboItem(Long comboId, Long productId, int quantity, int sortOrder) {
        this.comboId = comboId;
        this.productId = productId;
        this.quantity = quantity;
        this.sortOrder = sortOrder;
    }

    public int getSortOrder() { return sortOrder; }

    public Long getComboId() { return comboId; }
    public Long getProductId() { return productId; }
    public int getQuantity() { return quantity; }
}
