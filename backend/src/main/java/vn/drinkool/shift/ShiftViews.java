package vn.drinkool.shift;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import vn.drinkool.auth.AppUser;
import vn.drinkool.auth.AppUserRepository;
import vn.drinkool.shift.ShiftDtos.AssignmentDto;
import vn.drinkool.shift.ShiftDtos.ShiftDto;

/** Dựng kiểu {@code Shift} của W-3 → W-12, đọc phân ca và tên nhân viên theo lô. */
@Component
class ShiftViews {

    static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    private final ShiftAssignmentRepository assignments;
    private final AppUserRepository users;

    ShiftViews(ShiftAssignmentRepository assignments, AppUserRepository users) {
        this.assignments = assignments;
        this.users = users;
    }

    ShiftDto one(Shift shift) {
        return many(List.of(shift)).getFirst();
    }

    List<ShiftDto> many(List<Shift> shifts) {
        if (shifts.isEmpty()) {
            return List.of();
        }
        Map<Long, List<ShiftAssignment>> byShift = assignments
                .findByShiftIdInOrderByIdAsc(shifts.stream().map(Shift::getId).toList()).stream()
                .collect(Collectors.groupingBy(ShiftAssignment::getShiftId));
        Map<Long, String> names = users.findAllById(byShift.values().stream().flatMap(List::stream)
                        .map(ShiftAssignment::getStaffId).distinct().toList()).stream()
                .collect(Collectors.toMap(AppUser::getId, AppUser::getFullName));
        return shifts.stream().map(s -> {
            List<ShiftAssignment> list = byShift.getOrDefault(s.getId(), List.of());
            long occupied = list.stream().filter(a -> a.getStatus().occupies()).count();
            List<AssignmentDto> shown = list.stream()
                    .filter(a -> a.getStatus() != AssignmentStatus.CANCELLED)
                    .map(a -> new AssignmentDto(a.getId(), s.getId(), a.getStaffId(),
                            names.getOrDefault(a.getStaffId(), "#" + a.getStaffId()), a.getStatus(),
                            a.getLeaveReason()))
                    .toList();
            return new ShiftDto(s.getId(), s.getDepartmentId(), s.getShiftDate(), s.getStartTime().format(HH_MM),
                    s.getEndTime().format(HH_MM), s.getWage(), s.getMaxStaff(), s.isAllowCrossDepartment(),
                    s.getStatus(), s.getVersion(), occupied, Math.max(0, s.getMaxStaff() - occupied), shown);
        }).toList();
    }
}
