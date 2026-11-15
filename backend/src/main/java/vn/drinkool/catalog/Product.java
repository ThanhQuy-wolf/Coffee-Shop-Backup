package vn.drinkool.catalog;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long categoryId;
    private String name;
    private String description;
    private long price;
    private long costPrice;
    private String imageUrl;
    private boolean isAvailable;
    private Instant deletedAt;

    private Instant createdAt;
    private Instant updatedAt;

    protected Product() {
    }

    public Product(Instant now) {
        this.createdAt = now;
    }

    public void update(Long categoryId, String name, String description, long price, long costPrice,
                       String imageUrl, boolean isAvailable, Instant now) {
        this.categoryId = categoryId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.costPrice = costPrice;
        this.imageUrl = imageUrl;
        this.isAvailable = isAvailable;
        this.updatedAt = now;
    }

    public void setAvailable(boolean isAvailable, Instant now) {
        this.isAvailable = isAvailable;
        this.updatedAt = now;
    }

    public void softDelete(Instant now) {
        deletedAt = now;
        updatedAt = now;
    }

    public Long getId() { return id; }
    public Long getCategoryId() { return categoryId; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public long getPrice() { return price; }
    public long getCostPrice() { return costPrice; }
    public String getImageUrl() { return imageUrl; }
    public boolean isAvailable() { return isAvailable; }
    public Instant getDeletedAt() { return deletedAt; }
}
