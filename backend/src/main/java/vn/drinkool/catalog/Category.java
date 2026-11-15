package vn.drinkool.catalog;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String icon;
    private int sortOrder;
    private Instant deletedAt;

    private Instant createdAt;

    protected Category() {
    }

    public Category(String name, String icon, int sortOrder, Instant now) {
        update(name, icon, sortOrder);
        this.createdAt = now;
    }

    public void update(String name, String icon, int sortOrder) {
        this.name = name;
        this.icon = icon;
        this.sortOrder = sortOrder;
    }

    public void softDelete(Instant now) {
        deletedAt = now;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getIcon() { return icon; }
    public int getSortOrder() { return sortOrder; }
    public Instant getDeletedAt() { return deletedAt; }
}
