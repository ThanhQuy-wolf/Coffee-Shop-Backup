package vn.drinkool.catalog;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "option_value")
public class OptionValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long optionGroupId;
    private String name;
    private long priceDelta;
    private long costDelta;
    private boolean isDefault;
    private boolean isAvailable;
    private int sortOrder;
    private Instant deletedAt;

    protected OptionValue() {
    }

    public OptionValue(Long optionGroupId) {
        this.optionGroupId = optionGroupId;
        this.isAvailable = true;
    }

    public void update(String name, long priceDelta, long costDelta, boolean isDefault, int sortOrder) {
        this.name = name;
        this.priceDelta = priceDelta;
        this.costDelta = costDelta;
        this.isDefault = isDefault;
        this.sortOrder = sortOrder;
    }

    public void setAvailable(boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public void softDelete(Instant now) {
        deletedAt = now;
    }

    public Long getId() { return id; }
    public Long getOptionGroupId() { return optionGroupId; }
    public String getName() { return name; }
    public long getPriceDelta() { return priceDelta; }
    public long getCostDelta() { return costDelta; }
    public boolean isDefault() { return isDefault; }
    public boolean isAvailable() { return isAvailable; }
    public int getSortOrder() { return sortOrder; }
    public Instant getDeletedAt() { return deletedAt; }
}
