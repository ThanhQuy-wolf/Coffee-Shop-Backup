package vn.drinkool.shift;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;

import jakarta.persistence.EntityManager;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.drinkool.common.audit.AuditService;
import vn.drinkool.common.error.ApiException;
import vn.drinkool.common.security.CurrentUser;
import vn.drinkool.notification.Notifier;
import vn.drinkool.shift.ShiftDtos.ShiftDto;
import vn.drinkool.shop.ShopInfo;
import vn.drinkool.shop.ShopService;

/** W-7 → W-12: đăng ký ca, xin nghỉ, chấm công, gỡ người khỏi ca. */
@Service
@Transactional
public class AssignmentService {

    public static final String ATTENDANCE_MARKED = "ATTENDANCE_MARKED";

    private static final EnumSet<AssignmentStatus> ATTENDANCE_STATUSES =
            EnumSet.of(AssignmentStatus.REGISTERED, AssignmentStatus.ATTENDED, AssignmentStatus.ABSENT);

    private final ShiftRepository shifts;
    private final ShiftAssignmentRepository assignments;
    private final ShiftViews views;
    private final ShopService shop;
    private final Notifier notifier;
    private final AuditService audit;
    private final LeaveExpiryJob leaveExpiry;
    private final JdbcClient jdbc;
    private final EntityManager em;
    private final Clock clock;

    AssignmentService(ShiftRepository shifts, ShiftAssignmentRepository assignments, ShiftViews views,
                      ShopService shop, Notifier notifier, AuditService audit, LeaveExpiryJob leaveExpiry,
                      JdbcClient jdbc, EntityManager em, Clock clock) {
        this.shifts = shifts;
        this.assignments = assignments;
        this.views = views;
        this.shop = shop;
        this.notifier = notifier;
        this.audit = audit;
        this.leaveExpiry = leaveExpiry;
        this.jdbc = jdbc;
        this.em = em;
        this.clock = clock;
    }

    /** W-7. Thứ tự kiểm BR-46, BR-44, BR-43, BR-45 (R-51). */
    public ShiftDto register(Long shiftId) {
        Shift shift = shifts.findForUpdate(shiftId).orElseThrow(ShiftErrors::shiftNotFound);
        long me = CurrentUser.requireId();
        // R-52: khoá cả dòng nhân viên để hai lệnh đăng ký hai ca trùng giờ cùng lúc không cùng lọt BR-45
        Long departmentId = jdbc.sql("SELECT department_id FROM app_user WHERE id = :id FOR UPDATE")
                .param("id", me).query(Long.class).optional().orElse(null);
        ShopInfo settings = shop.current();
        Instant now = clock.instant();
        Duration startsIn = Duration.between(now, shift.startsAt());
        if (shift.getStatus() != Shift.Status.OPEN || !startsIn.isPositive()) {
            throw ShiftErrors.rule("BR-46", "Chỉ đăng ký được ca đang mở và chưa bắt đầu");
        }
        if (startsIn.compareTo(Duration.ofDays(settings.getShiftBookingDays())) > 0) {
            throw ShiftErrors.rule("BR-46", "Chỉ đăng ký được ca trong " + settings.getShiftBookingDays()
                    + " ngày tới");
        }
        boolean isStaff = "STAFF".equals(CurrentUser.role().orElse(null));
        if (isStaff && !shift.getDepartmentId().equals(departmentId) && !shift.isAllowCrossDepartment()) {
            throw ShiftErrors.rule("BR-46", "Ca này thuộc bộ phận khác");
        }
        if (assignments.existsByShiftIdAndStaffIdAndStatusIn(shiftId, me, AssignmentStatus.OCCUPYING)) {
            throw ShiftErrors.conflict("BR-44", "Bạn đã có trong ca này");
        }
        if (assignments.countByShiftIdAndStatusIn(shiftId, AssignmentStatus.OCCUPYING) >= shift.getMaxStaff()) {
            throw ShiftErrors.conflict("BR-43", "Ca đã đủ người");
        }
        List<Shift> clash = shifts.clashes(me, AssignmentStatus.OCCUPYING, Shift.Status.OPEN, shift.getShiftDate(),
                shift.getStartTime(), shift.getEndTime(), shiftId);
        if (!clash.isEmpty()) {
            throw ShiftErrors.rule("BR-45", "Trùng giờ với ca " + ShiftErrors.slot(clash.getFirst())
                    + " bạn đã đăng ký");
        }
        em.persist(new ShiftAssignment(shiftId, me, now));
        return views.one(shift);
    }

    /** W-8 */
    public ShiftDto unregister(Long shiftId) {
        Shift shift = shifts.findById(shiftId).orElseThrow(ShiftErrors::shiftNotFound);
        long me = CurrentUser.requireId();
        ShiftAssignment mine = assignments.findByShiftIdAndStaffIdAndStatus(shiftId, me, AssignmentStatus.REGISTERED)
                .stream().findFirst()
                .orElseThrow(() -> ApiException.notFound("Bạn chưa đăng ký ca này"));
        int hours = shop.current().getShiftCancelHours();
        Instant now = clock.instant();
        if (Duration.between(now, shift.startsAt()).compareTo(Duration.ofHours(hours)) < 0) {
            throw ShiftErrors.rule("BR-47", "Ca bắt đầu trong chưa đầy " + hours
                    + " giờ, hãy gửi yêu cầu xin nghỉ");
        }
        mine.moveTo(AssignmentStatus.CANCELLED, now);
        return saved(shift);
    }

    /** W-9: chỗ vẫn giữ tới khi quản lý quyết định (BR-48). */
    public ShiftDto requestLeave(Long assignmentId, String reason) {
        ShiftAssignment a = assignments.findById(assignmentId).orElseThrow(ShiftErrors::assignmentNotFound);
        Shift shift = shifts.findById(a.getShiftId()).orElseThrow(ShiftErrors::shiftNotFound);
        if (a.getStaffId() != CurrentUser.requireId()) {
            throw ApiException.forbidden("Đây không phải phân ca của bạn");
        }
        if (reason == null || reason.isBlank()) {
            throw ShiftErrors.rule("BR-48", "Vui lòng nhập lý do xin nghỉ");
        }
        Instant now = clock.instant();
        if (a.getStatus() != AssignmentStatus.REGISTERED || shift.hasStarted(now)) {
            throw ShiftErrors.rule("BR-48", "Chỉ xin nghỉ được ca đã đăng ký và chưa bắt đầu");
        }
        a.requestLeave(reason.strip(), now);
        return saved(shift);
    }

    /** W-10 */
    public ShiftDto decideLeave(Long assignmentId, boolean approve) {
        // R-54: chạy bước của job BR-48 trước để không duyệt một yêu cầu đã hết hạn
        leaveExpiry.expire();
        ShiftAssignment a = load(assignmentId);
        Shift shift = shifts.findById(a.getShiftId()).orElseThrow(ShiftErrors::shiftNotFound);
        Instant now = clock.instant();
        if (a.getStatus() != AssignmentStatus.LEAVE_REQUESTED || shift.hasStarted(now)) {
            throw ShiftErrors.rule("BR-48", "Yêu cầu nghỉ không còn chờ duyệt");
        }
        a.decide(approve, CurrentUser.requireId(), now);
        notifier.send(a.getStaffId(), approve ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
                "Yêu cầu nghỉ ca " + shift.getShiftDate() + " " + shift.getStartTime().format(ShiftViews.HH_MM)
                        + " đã " + (approve ? "được duyệt" : "bị từ chối") + ".",
                Map.of("shiftId", shift.getId()));
        return saved(shift);
    }

    /** W-11: ghi audit_log (NFR-03, R-53). */
    public ShiftDto markAttendance(Long assignmentId, AssignmentStatus status) {
        if (status != AssignmentStatus.ATTENDED && status != AssignmentStatus.ABSENT) {
            throw ApiException.validation("status chỉ nhận ATTENDED hoặc ABSENT");
        }
        leaveExpiry.expire();
        ShiftAssignment a = load(assignmentId);
        Shift shift = shifts.findById(a.getShiftId()).orElseThrow(ShiftErrors::shiftNotFound);
        Instant now = clock.instant();
        if (!shift.hasStarted(now)) {
            throw ShiftErrors.rule("BR-49", "Chỉ chấm công được sau khi ca bắt đầu");
        }
        int days = shop.current().getAttendanceEditDays();
        if (Duration.between(shift.startsAt(), now).compareTo(Duration.ofDays(days)) > 0) {
            throw ShiftErrors.rule("BR-49", "Chỉ sửa chấm công được trong " + days + " ngày");
        }
        if (!ATTENDANCE_STATUSES.contains(a.getStatus())) {
            throw ShiftErrors.rule("BR-49", "Phân ca này không cần chấm công");
        }
        AssignmentStatus before = a.getStatus();
        a.moveTo(status, now);
        audit.record(ATTENDANCE_MARKED, "SHIFT_ASSIGNMENT", a.getId(), Map.of("status", before.name()),
                Map.of("status", status.name(), "shiftId", shift.getId(), "staffId", a.getStaffId()));
        return saved(shift);
    }

    /** W-12 */
    public ShiftDto remove(Long assignmentId) {
        ShiftAssignment a = load(assignmentId);
        Shift shift = shifts.findById(a.getShiftId()).orElseThrow(ShiftErrors::shiftNotFound);
        Instant now = clock.instant();
        if (!a.getStatus().occupies() || shift.hasStarted(now)) {
            throw ShiftErrors.rule("BR-42", "Chỉ gỡ được người khỏi ca chưa bắt đầu");
        }
        a.moveTo(AssignmentStatus.CANCELLED, now);
        notifier.send(a.getStaffId(), "ASSIGNMENT_REMOVED", "Bạn đã được gỡ khỏi ca " + ShiftErrors.slot(shift)
                + ".", Map.of("shiftId", shift.getId()));
        return saved(shift);
    }

    /** Job vừa sửa bằng SQL thuần, nên đọc lại từ DB thay vì dùng bản trong persistence context. */
    private ShiftAssignment load(Long assignmentId) {
        ShiftAssignment a = assignments.findById(assignmentId).orElseThrow(ShiftErrors::assignmentNotFound);
        em.refresh(a);
        return a;
    }

    private ShiftDto saved(Shift shift) {
        assignments.flush();
        return views.one(shift);
    }
}
