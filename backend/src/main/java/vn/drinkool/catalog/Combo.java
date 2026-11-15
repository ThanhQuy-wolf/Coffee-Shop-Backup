package vn.drinkool.catalog;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "combo")
public class Combo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private long price;
    private String imageUrl;
    private boolean isAvailable;
    private Instant deletedAt;

    private Instant createdAt;

    protected Combo() {
    }

    public Combo(Instant now) {
        this.createdAt = now;
    }

    public void update(String name, String description, long price, String imageUrl, boolean isAvailable) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.isAvailable = isAvailable;
    }

    public void setAvailable(boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public void softDelete(Instant now) {
        deletedAt = now;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public long getPrice() { return price; }
    public String getImageUrl() { return imageUrl; }
    public boolean isAvailable() { return isAvailable; }
    public Instant getDeletedAt() { return deletedAt; }
}
