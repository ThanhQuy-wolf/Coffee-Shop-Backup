package vn.drinkool.shift;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import jakarta.persistence.EntityManager;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.auth.AppUser;
import vn.drinkool.auth.AppUserRepository;
import vn.drinkool.auth.Role;
import vn.drinkool.common.error.ApiException;
import vn.drinkool.common.error.BusinessRuleException;
import vn.drinkool.common.security.CurrentUser;
import vn.drinkool.notification.Notifier;
import vn.drinkool.shift.ShiftDtos.CancelShiftRequest;
import vn.drinkool.shift.ShiftDtos.DepartmentDto;
import vn.drinkool.shift.ShiftDtos.ShiftDto;
import vn.drinkool.shift.ShiftDtos.ShiftInput;
import vn.drinkool.shift.ShiftDtos.StaffDto;

/** W-1 → W-6: lịch ca của quản lý. */
@Service
@Transactional
public class ShiftService {

    private final ShiftRepository shifts;
    private final ShiftAssignmentRepository assignments;
    private final DepartmentRepository departments;
    private final AppUserRepository users;
    private final ShiftViews views;
    private final Notifier notifier;
    private final EntityManager em;
    private final Clock clock;

    ShiftService(ShiftRepository shifts, ShiftAssignmentRepository assignments, DepartmentRepository departments,
                 AppUserRepository users, ShiftViews views, Notifier notifier, EntityManager em, Clock clock) {
        this.shifts = shifts;
        this.assignments = assignments;
        this.departments = departments;
        this.users = users;
        this.views = views;
        this.notifier = notifier;
        this.em = em;
        this.clock = clock;
    }

    /** W-1 */
    @Transactional(readOnly = true)
    public List<DepartmentDto> departments() {
        return departments.findAllByOrderByIdAsc().stream()
                .map(d -> new DepartmentDto(d.getId(), d.getCode(), d.getName(), d.getIcon()))
                .toList();
    }

    /** W-2 */
    @Transactional(readOnly = true)
    public List<StaffDto> staff() {
        return users.findByRoleInOrderByIdAsc(EnumSet.of(Role.STAFF, Role.MANAGER)).stream()
                .map(u -> new StaffDto(u.getId(), u.getFullName(), u.getRole(), u.getDepartmentId()))
                .toList();
    }

    /** W-3 */
    @Transactional(readOnly = true)
    public List<ShiftDto> calendar(String from, String to, Long departmentId) {
        LocalDate start = parseDate("from", from);
        LocalDate end = parseDate("to", to);
        if (end.isBefore(start)) {
            throw ApiException.validation("to phải từ from trở đi");
        }
        return views.many(shifts.calendar(start, end, departmentId));
    }

    /** W-4 */
    public ShiftDto create(ShiftInput in) {
        Shift shift = new Shift(CurrentUser.requireId(), clock.instant());
        apply(shift, in);
        // persist: entity mới đã có version = 1 nên save() của Spring Data sẽ merge
        em.persist(shift);
        return views.one(shift);
    }

    /** W-5: người đang trong ca giữ nguyên, nên chặn nếu làm họ trùng lịch hoặc thừa người. */
    public ShiftDto update(Long id, ShiftInput in) {
        if (in.version() == null) {
            throw ApiException.validation("Thiếu version");
        }
        Shift shift = shifts.findById(id).orElseThrow(ShiftErrors::shiftNotFound);
        checkVersion(shift, in.version());
        if (shift.getStatus() == Shift.Status.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT, "ORDER_STATE", "Ca đã bị huỷ", null);
        }
        List<ShiftAssignment> holders = assignments.findByShiftIdAndStatusIn(id, AssignmentStatus.OCCUPYING);
        Slot slot = validate(in);
        if (in.maxStaff() < holders.size()) {
            throw ShiftErrors.rule("BR-41", "Ca đang có " + holders.size()
                    + " người, không giảm số người tối đa xuống thấp hơn");
        }
        for (ShiftAssignment a : holders) {
            List<Shift> clash = shifts.clashes(a.getStaffId(), AssignmentStatus.OCCUPYING, Shift.Status.OPEN,
                    in.date(), slot.start, slot.end, id);
            if (!clash.isEmpty()) {
                String name = users.findById(a.getStaffId()).map(AppUser::getFullName).orElse("#" + a.getStaffId());
                throw ShiftErrors.rule("BR-42", "Đổi giờ làm " + name + " bị trùng ca "
                        + ShiftErrors.slot(clash.getFirst()));
            }
        }
        shift.update(in.departmentId(), in.date(), slot.start, slot.end, in.wage(), in.maxStaff(),
                in.allowCrossDepartment());
        shifts.flush();
        return views.one(shift);
    }

    /** W-6: mọi phân ca đang giữ chỗ bị huỷ và người trong ca được báo (BR-42). */
    public ShiftDto cancel(Long id, CancelShiftRequest req) {
        Shift shift = shifts.findById(id).orElseThrow(ShiftErrors::shiftNotFound);
        checkVersion(shift, req.version());
        if (shift.getStatus() == Shift.Status.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT, "ORDER_STATE", "Ca đã bị huỷ", null);
        }
        var now = clock.instant();
        if (shift.hasStarted(now)) {
            throw ShiftErrors.rule("BR-42", "Không huỷ được ca đã bắt đầu");
        }
        shift.cancel();
        String reason = req.reason() == null || req.reason().isBlank() ? null : req.reason().strip();
        for (ShiftAssignment a : assignments.findByShiftIdAndStatusIn(id, AssignmentStatus.OCCUPYING)) {
            a.moveTo(AssignmentStatus.CANCELLED, now);
            notifier.send(a.getStaffId(), "SHIFT_CANCELLED", "Ca " + ShiftErrors.slot(shift) + " đã bị huỷ."
                    + (reason == null ? "" : " Lý do: " + reason), Map.of("shiftId", id));
        }
        shifts.flush();
        return views.one(shift);
    }

    private record Slot(LocalTime start, LocalTime end) {
    }

    private void apply(Shift shift, ShiftInput in) {
        Slot slot = validate(in);
        shift.update(in.departmentId(), in.date(), slot.start, slot.end, in.wage(), in.maxStaff(),
                in.allowCrossDepartment());
    }

    /** BR-40, BR-41 và bộ phận tồn tại. */
    private Slot validate(ShiftInput in) {
        LocalTime start = parseTime("startTime", in.startTime());
        LocalTime end = parseTime("endTime", in.endTime());
        if (!end.isAfter(start)) {
            throw ShiftErrors.rule("BR-40", "Giờ kết thúc phải sau giờ bắt đầu, trong cùng một ngày");
        }
        if (in.maxStaff() < 1 || in.maxStaff() > 20) {
            throw ShiftErrors.rule("BR-41", "Số người tối đa từ 1 đến 20");
        }
        if (in.wage() <= 0) {
            throw ShiftErrors.rule("BR-41", "Lương mỗi ca phải lớn hơn 0");
        }
        if (!departments.existsById(in.departmentId())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "VALIDATION", "Bộ phận không tồn tại", null);
        }
        return new Slot(start, end);
    }

    private static void checkVersion(Shift shift, Integer version) {
        if (!Objects.equals(shift.getVersion(), version)) {
            throw new BusinessRuleException(HttpStatus.CONFLICT, "BR-27", "Ca vừa được người khác cập nhật")
                    .with("currentVersion", shift.getVersion());
        }
    }

    private static LocalTime parseTime(String field, String value) {
        try {
            return LocalTime.parse(value, ShiftViews.HH_MM);
        } catch (DateTimeParseException e) {
            throw ApiException.validation(field + " phải có dạng HH:mm");
        }
    }

    private static LocalDate parseDate(String field, String value) {
        if (value == null || value.isBlank()) {
            throw ApiException.validation("Thiếu " + field);
        }
        try {
            return LocalDate.parse(value.strip());
        } catch (DateTimeParseException e) {
            throw ApiException.validation(field + " phải có dạng YYYY-MM-DD");
        }
    }
}
