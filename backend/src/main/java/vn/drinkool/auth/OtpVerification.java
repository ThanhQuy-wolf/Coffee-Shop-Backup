package vn.drinkool.auth;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "otp_verification")
public class OtpVerification {

    public static final String PURPOSE_REGISTER = "REGISTER";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phone;
    private String purpose;
    private String codeHash;
    private int attemptCount;
    private Instant expiresAt;
    private Instant consumedAt;
    private Instant createdAt;

    protected OtpVerification() {
    }

    public OtpVerification(String phone, String codeHash, Instant createdAt, Instant expiresAt) {
        this.phone = phone;
        this.purpose = PURPOSE_REGISTER;
        this.codeHash = codeHash;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public boolean isUsableAt(Instant now) {
        return consumedAt == null && expiresAt.isAfter(now);
    }

    public void recordWrongAttempt() {
        attemptCount++;
    }

    public void consume(Instant now) {
        consumedAt = now;
    }

    public String getCodeHash() { return codeHash; }
    public int getAttemptCount() { return attemptCount; }
    public Instant getCreatedAt() { return createdAt; }
}
