package vn.drinkool.catalog;

import org.springframework.http.HttpStatus;

import vn.drinkool.common.error.ApiException;
import vn.drinkool.common.error.BusinessRuleException;

final class CatalogErrors {

    private CatalogErrors() {
    }

    static BusinessRuleException rule(String rule, String title, String detail) {
        return new BusinessRuleException(HttpStatus.UNPROCESSABLE_CONTENT, rule, title, detail);
    }

    static BusinessRuleException conflict(String rule, String title, String detail) {
        return new BusinessRuleException(HttpStatus.CONFLICT, rule, title, detail);
    }

    static ApiException notFound(String what) {
        return ApiException.notFound("Không tìm thấy " + what);
    }
}
