package vn.drinkool.order;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;

import vn.drinkool.common.error.ApiException;
import vn.drinkool.common.error.BusinessRuleException;

final class OrderErrors {

    private OrderErrors() {
    }

    static BusinessRuleException versionMismatch(Integer currentVersion) {
        BusinessRuleException ex = new BusinessRuleException(HttpStatus.CONFLICT, "BR-27",
                "Đơn vừa được người khác cập nhật", "Tải lại đơn rồi thao tác lại");
        return currentVersion == null ? ex : ex.with("currentVersion", currentVersion);
    }

    static ApiException wrongState(OrderStatus current, String action) {
        return new ApiException(HttpStatus.CONFLICT, "ORDER_STATE", "Không chuyển được trạng thái đơn",
                "Đơn đang ở trạng thái " + current + ", không thể " + action)
                .with("status", current.name());
    }

    static BusinessRuleException lines(HttpStatus status, String rule, String title, List<Map<String, Object>> errors) {
        return new BusinessRuleException(status, rule, title, errors.size() + " lỗi trong giỏ hàng")
                .with("errors", errors);
    }
}
