package vn.drinkool.shift;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Long> {

    List<ShiftAssignment> findByShiftIdInOrderByIdAsc(Collection<Long> shiftIds);

    List<ShiftAssignment> findByShiftIdAndStatusIn(Long shiftId, Collection<AssignmentStatus> statuses);

    long countByShiftIdAndStatusIn(Long shiftId, Collection<AssignmentStatus> statuses);

    boolean existsByShiftIdAndStaffIdAndStatusIn(Long shiftId, Long staffId, Collection<AssignmentStatus> statuses);

    List<ShiftAssignment> findByShiftIdAndStaffIdAndStatus(Long shiftId, Long staffId, AssignmentStatus status);
}
