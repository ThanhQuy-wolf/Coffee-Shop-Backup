package vn.drinkool.shift;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import vn.drinkool.common.config.ClockConfig;

@Entity
@Table(name = "shift")
public class Shift {

    public enum Status { OPEN, CANCELLED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long departmentId;
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private long wage;
    private int maxStaff;
    private boolean allowCrossDepartment;

    @Enumerated(EnumType.STRING)
    private Status status = Status.OPEN;

    private Long createdBy;

    // BR-27 áp cho cả ca (W-5, W-6)
    @Version
    private Integer version = 1;

    private Instant createdAt;

    protected Shift() {
    }

    Shift(Long createdBy, Instant createdAt) {
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    void update(Long departmentId, LocalDate date, LocalTime start, LocalTime end, long wage, int maxStaff,
                boolean allowCrossDepartment) {
        this.departmentId = departmentId;
        this.shiftDate = date;
        this.startTime = start;
        this.endTime = end;
        this.wage = wage;
        this.maxStaff = maxStaff;
        this.allowCrossDepartment = allowCrossDepartment;
    }

    void cancel() {
        status = Status.CANCELLED;
    }

    /** Giờ bắt đầu theo giờ quán. */
    Instant startsAt() {
        return shiftDate.atTime(startTime).atZone(ClockConfig.SHOP_ZONE).toInstant();
    }

    boolean hasStarted(Instant now) {
        return !now.isBefore(startsAt());
    }

    public Long getId() { return id; }
    public Long getDepartmentId() { return departmentId; }
    public LocalDate getShiftDate() { return shiftDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public long getWage() { return wage; }
    public int getMaxStaff() { return maxStaff; }
    public boolean isAllowCrossDepartment() { return allowCrossDepartment; }
    public Status getStatus() { return status; }
    public int getVersion() { return version; }
}
