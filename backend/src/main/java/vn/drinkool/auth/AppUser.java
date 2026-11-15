package vn.drinkool.auth;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_user")
public class AppUser {

    public enum Status { ACTIVE, LOCKED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String phone;
    private String username;
    private String passwordHash;
    private String fullName;
    private String avatarUrl;
    private Long departmentId;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    private int failedLoginCount;
    private Instant lockedUntil;

    @Column(insertable = false, updatable = false)
    private Instant createdAt;

    protected AppUser() {
    }

    public static AppUser customer(String phone, String passwordHash, String fullName) {
        AppUser u = new AppUser();
        u.role = Role.CUSTOMER;
        u.phone = phone;
        u.passwordHash = passwordHash;
        u.fullName = fullName;
        return u;
    }

    /** BR-04: đếm lần sai liên tiếp, đủ {@code maxFailures} thì khoá tới {@code lockUntil} và đếm lại từ đầu. */
    public boolean recordFailedLogin(int maxFailures, Instant lockUntil) {
        failedLoginCount++;
        if (failedLoginCount >= maxFailures) {
            failedLoginCount = 0;
            lockedUntil = lockUntil;
            return true;
        }
        return false;
    }

    public void recordSuccessfulLogin() {
        failedLoginCount = 0;
        lockedUntil = null;
    }

    public boolean isLockedAt(Instant now) {
        return status == Status.LOCKED || (lockedUntil != null && lockedUntil.isAfter(now));
    }

    public Long getId() { return id; }
    public Role getRole() { return role; }
    public String getPhone() { return phone; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getFullName() { return fullName; }
    public String getAvatarUrl() { return avatarUrl; }
    public Long getDepartmentId() { return departmentId; }
    public Status getStatus() { return status; }
    public int getFailedLoginCount() { return failedLoginCount; }
    public Instant getLockedUntil() { return lockedUntil; }
}
