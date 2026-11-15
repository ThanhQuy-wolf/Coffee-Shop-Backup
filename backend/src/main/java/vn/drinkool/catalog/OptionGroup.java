package vn.drinkool.catalog;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "option_group")
public class OptionGroup {

    public enum SelectionType { SINGLE, MULTIPLE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private SelectionType selectionType;

    private int minSelect;
    private int maxSelect;
    private int sortOrder;
    private Instant deletedAt;

    private Instant createdAt;

    protected OptionGroup() {
    }

    public OptionGroup(Instant now) {
        this.createdAt = now;
    }

    public void update(String name, SelectionType selectionType, int minSelect, int maxSelect, int sortOrder) {
        this.name = name;
        this.selectionType = selectionType;
        this.minSelect = minSelect;
        this.maxSelect = maxSelect;
        this.sortOrder = sortOrder;
    }

    public void softDelete(Instant now) {
        deletedAt = now;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public SelectionType getSelectionType() { return selectionType; }
    public int getMinSelect() { return minSelect; }
    public int getMaxSelect() { return maxSelect; }
    public int getSortOrder() { return sortOrder; }
    public Instant getDeletedAt() { return deletedAt; }
}
