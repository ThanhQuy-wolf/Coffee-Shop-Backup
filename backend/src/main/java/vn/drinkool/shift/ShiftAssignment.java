package vn.drinkool.shift;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "shift_assignment")
public class ShiftAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long shiftId;
    private Long staffId;

    @Enumerated(EnumType.STRING)
    private AssignmentStatus status;

    private String leaveReason;
    private Long decidedBy;
    private Instant decidedAt;
    private Instant createdAt;
    private Instant updatedAt;

    protected ShiftAssignment() {
    }

    ShiftAssignment(Long shiftId, Long staffId, Instant now) {
        this.shiftId = shiftId;
        this.staffId = staffId;
        this.status = AssignmentStatus.REGISTERED;
        this.createdAt = now;
        this.updatedAt = now;
    }

    void moveTo(AssignmentStatus next, Instant now) {
        status = next;
        updatedAt = now;
    }

    void requestLeave(String reason, Instant now) {
        leaveReason = reason;
        moveTo(AssignmentStatus.LEAVE_REQUESTED, now);
    }

    void decide(boolean approve, Long by, Instant now) {
        decidedBy = by;
        decidedAt = now;
        moveTo(approve ? AssignmentStatus.LEAVE_APPROVED : AssignmentStatus.REGISTERED, now);
    }

    public Long getId() { return id; }
    public Long getShiftId() { return shiftId; }
    public Long getStaffId() { return staffId; }
    public AssignmentStatus getStatus() { return status; }
    public String getLeaveReason() { return leaveReason; }
}
