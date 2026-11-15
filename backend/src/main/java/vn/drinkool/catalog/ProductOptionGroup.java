package vn.drinkool.catalog;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_option_group")
@IdClass(ProductOptionGroup.Key.class)
public class ProductOptionGroup {

    public record Key(Long productId, Long optionGroupId) implements Serializable {
        public Key() {
            this(null, null);
        }
    }

    @Id
    private Long productId;

    @Id
    private Long optionGroupId;

    private int sortOrder;

    protected ProductOptionGroup() {
    }

    public ProductOptionGroup(Long productId, Long optionGroupId, int sortOrder) {
        this.productId = productId;
        this.optionGroupId = optionGroupId;
        this.sortOrder = sortOrder;
    }

    public Long getProductId() { return productId; }
    public Long getOptionGroupId() { return optionGroupId; }
    public int getSortOrder() { return sortOrder; }
}
