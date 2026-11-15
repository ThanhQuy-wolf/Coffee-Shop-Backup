package vn.drinkool.shift;

import org.springframework.http.HttpStatus;

import vn.drinkool.common.error.ApiException;
import vn.drinkool.common.error.BusinessRuleException;

final class ShiftErrors {

    private ShiftErrors() {
    }

    static BusinessRuleException rule(String rule, String title) {
        return new BusinessRuleException(HttpStatus.UNPROCESSABLE_CONTENT, rule, title);
    }

    static BusinessRuleException conflict(String rule, String title) {
        return new BusinessRuleException(HttpStatus.CONFLICT, rule, title);
    }

    static ApiException shiftNotFound() {
        return ApiException.notFound("Không tìm thấy ca");
    }

    static ApiException assignmentNotFound() {
        return ApiException.notFound("Không tìm thấy phân ca");
    }

    static String slot(Shift s) {
        return s.getShiftDate() + " " + s.getStartTime().format(ShiftViews.HH_MM) + "–"
                + s.getEndTime().format(ShiftViews.HH_MM);
    }
}
