package vn.drinkool.order;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Lựa chọn của một dòng. Dòng combo có {@code componentNo} chỉ ly thứ mấy (FR-37). */
@Entity
@Table(name = "order_item_option")
public class OrderItemOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Short componentNo;
    private Long componentProductId;
    private String componentNameSnapshot;
    private Long optionGroupId;
    private Long optionValueId;
    private String groupNameSnapshot;
    private String valueNameSnapshot;
    private long priceDelta;
    private long costDelta;

    protected OrderItemOption() {
    }

    OrderItemOption(Integer componentNo, Long componentProductId, String componentName, Long optionGroupId,
                    Long optionValueId, String groupName, String valueName, long priceDelta, long costDelta) {
        this.componentNo = componentNo == null ? null : componentNo.shortValue();
        this.componentProductId = componentProductId;
        this.componentNameSnapshot = componentName;
        this.optionGroupId = optionGroupId;
        this.optionValueId = optionValueId;
        this.groupNameSnapshot = groupName;
        this.valueNameSnapshot = valueName;
        this.priceDelta = priceDelta;
        this.costDelta = costDelta;
    }

    public Integer getComponentNo() { return componentNo == null ? null : componentNo.intValue(); }
    public String getComponentNameSnapshot() { return componentNameSnapshot; }
    public Long getOptionValueId() { return optionValueId; }
    public String getGroupNameSnapshot() { return groupNameSnapshot; }
    public String getValueNameSnapshot() { return valueNameSnapshot; }
    public long getPriceDelta() { return priceDelta; }
    public long getCostDelta() { return costDelta; }
}
