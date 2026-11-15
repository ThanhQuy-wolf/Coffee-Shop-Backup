package vn.drinkool.shift;

import java.util.EnumSet;
import java.util.Set;

public enum AssignmentStatus {
    REGISTERED, CANCELLED, LEAVE_REQUESTED, LEAVE_APPROVED, ATTENDED, ABSENT;

    /** BR-43: các trạng thái giữ chỗ trong ca. LEAVE_APPROVED và CANCELLED trả lại chỗ. */
    public static final Set<AssignmentStatus> OCCUPYING = EnumSet.of(REGISTERED, LEAVE_REQUESTED, ATTENDED, ABSENT);

    public boolean occupies() {
        return OCCUPYING.contains(this);
    }
}
