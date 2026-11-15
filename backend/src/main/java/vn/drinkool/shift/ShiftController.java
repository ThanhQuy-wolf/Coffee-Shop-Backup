package vn.drinkool.shift;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import vn.drinkool.shift.ShiftDtos.AttendanceRequest;
import vn.drinkool.shift.ShiftDtos.CancelShiftRequest;
import vn.drinkool.shift.ShiftDtos.DepartmentDto;
import vn.drinkool.shift.ShiftDtos.LeaveDecision;
import vn.drinkool.shift.ShiftDtos.LeaveRequest;
import vn.drinkool.shift.ShiftDtos.ShiftDto;
import vn.drinkool.shift.ShiftDtos.ShiftInput;
import vn.drinkool.shift.ShiftDtos.StaffDto;

@RestController
@RequestMapping("/api/v1")
public class ShiftController {

    private final ShiftService shifts;
    private final AssignmentService assignments;

    ShiftController(ShiftService shifts, AssignmentService assignments) {
        this.shifts = shifts;
        this.assignments = assignments;
    }

    /** W-1 */
    @GetMapping("/departments")
    public List<DepartmentDto> departments() {
        return shifts.departments();
    }

    /** W-2 */
    @GetMapping("/staff")
    public List<StaffDto> staff() {
        return shifts.staff();
    }

    /** W-3 */
    @GetMapping("/shifts")
    public List<ShiftDto> calendar(@RequestParam(required = false) String from,
                                   @RequestParam(required = false) String to,
                                   @RequestParam(required = false) Long departmentId) {
        return shifts.calendar(from, to, departmentId);
    }

    /** W-4 */
    @PostMapping("/shifts")
    @ResponseStatus(HttpStatus.CREATED)
    public ShiftDto create(@Valid @RequestBody ShiftInput in) {
        return shifts.create(in);
    }

    /** W-5 */
    @PutMapping("/shifts/{shiftId}")
    public ShiftDto update(@PathVariable Long shiftId, @Valid @RequestBody ShiftInput in) {
        return shifts.update(shiftId, in);
    }

    /** W-6 */
    @PostMapping("/shifts/{shiftId}/cancel")
    public ShiftDto cancel(@PathVariable Long shiftId, @Valid @RequestBody CancelShiftRequest req) {
        return shifts.cancel(shiftId, req);
    }

    /** W-7 */
    @PostMapping("/shifts/{shiftId}/registrations")
    public ShiftDto register(@PathVariable Long shiftId) {
        return assignments.register(shiftId);
    }

    /** W-8 */
    @DeleteMapping("/shifts/{shiftId}/registrations/me")
    public ShiftDto unregister(@PathVariable Long shiftId) {
        return assignments.unregister(shiftId);
    }

    /** W-9 */
    @PostMapping("/shift-assignments/{assignmentId}/leave-request")
    public ShiftDto requestLeave(@PathVariable Long assignmentId, @Valid @RequestBody LeaveRequest req) {
        return assignments.requestLeave(assignmentId, req.reason());
    }

    /** W-10 */
    @PostMapping("/shift-assignments/{assignmentId}/leave-decision")
    public ShiftDto decideLeave(@PathVariable Long assignmentId, @Valid @RequestBody LeaveDecision req) {
        return assignments.decideLeave(assignmentId, req.approve());
    }

    /** W-11 */
    @PostMapping("/shift-assignments/{assignmentId}/attendance")
    public ShiftDto markAttendance(@PathVariable Long assignmentId, @Valid @RequestBody AttendanceRequest req) {
        return assignments.markAttendance(assignmentId, req.status());
    }

    /** W-12 */
    @DeleteMapping("/shift-assignments/{assignmentId}")
    public ShiftDto remove(@PathVariable Long assignmentId) {
        return assignments.remove(assignmentId);
    }
}
