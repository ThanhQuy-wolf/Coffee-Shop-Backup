package vn.drinkool.shift;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import vn.drinkool.auth.Role;

/** Request và response của nhóm W (docs/05-api.md §2.6). */
public final class ShiftDtos {

    private ShiftDtos() {
    }

    /** W-4, W-5. {@code version} chỉ bắt buộc ở W-5. Giờ dạng HH:mm. */
    public record ShiftInput(
            @NotNull Long departmentId,
            @NotNull LocalDate date,
            @NotNull String startTime,
            @NotNull String endTime,
            @NotNull Long wage,
            @NotNull Integer maxStaff,
            boolean allowCrossDepartment,
            Integer version) {
    }

    public record CancelShiftRequest(@Size(max = 300) String reason, @NotNull Integer version) {
    }

    public record LeaveRequest(@Size(max = 300) String reason) {
    }

    public record LeaveDecision(@NotNull Boolean approve) {
    }

    public record AttendanceRequest(@NotNull AssignmentStatus status) {
    }

    public record DepartmentDto(Long id, String code, String name, String icon) {
    }

    public record StaffDto(Long id, String fullName, Role role, Long departmentId) {
    }

    public record AssignmentDto(Long id, Long shiftId, Long staffId, String staffName, AssignmentStatus status,
                                String leaveReason) {
    }

    public record ShiftDto(Long id, Long departmentId, LocalDate date, String startTime, String endTime, long wage,
                           int maxStaff, boolean allowCrossDepartment, Shift.Status status, int version,
                           long occupied, long remaining, List<AssignmentDto> assignments) {
    }
}
