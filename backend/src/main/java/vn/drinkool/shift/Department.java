package vn.drinkool.shift;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "department")
public class Department {

    @Id
    private Long id;

    private String code;
    private String name;
    private String icon;

    protected Department() {
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getIcon() { return icon; }
}
