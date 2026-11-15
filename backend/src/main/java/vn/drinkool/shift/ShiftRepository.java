package vn.drinkool.shift;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface ShiftRepository extends JpaRepository<Shift, Long> {

    @Query("""
            select s from Shift s
            where s.shiftDate between :from and :to and (:departmentId is null or s.departmentId = :departmentId)
            order by s.shiftDate, s.startTime, s.id""")
    List<Shift> calendar(LocalDate from, LocalDate to, Long departmentId);

    /** W-7: SELECT … FOR UPDATE trên dòng ca (docs/05-api.md §4). */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Shift s where s.id = :id")
    Optional<Shift> findForUpdate(Long id);

    /** BR-45: ca đang mở cùng ngày mà người này giữ chỗ và giờ chồng lên [start, end). */
    @Query("""
            select s from ShiftAssignment a join Shift s on s.id = a.shiftId
            where a.staffId = :staffId and a.status in :occupying and s.status = :open
              and s.shiftDate = :date and s.id <> :excludeShiftId
              and s.startTime < :end and :start < s.endTime
            order by s.startTime""")
    List<Shift> clashes(Long staffId, Collection<AssignmentStatus> occupying, Shift.Status open, LocalDate date,
                        LocalTime start, LocalTime end, Long excludeShiftId);
}
