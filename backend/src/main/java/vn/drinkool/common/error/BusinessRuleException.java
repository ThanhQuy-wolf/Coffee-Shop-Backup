package vn.drinkool.common.error;

import org.springframework.http.HttpStatus;

/** Vi phạm một BR-xx trong docs/02-business-rules.md. Mã BR đi vào trường {@code rule} của problem. */
public class BusinessRuleException extends ApiException {

    public BusinessRuleException(HttpStatus status, String rule, String title, String detail) {
        super(status, rule, title, detail);
    }

    public BusinessRuleException(HttpStatus status, String rule, String title) {
        this(status, rule, title, null);
    }

    @Override
    public BusinessRuleException with(String key, Object value) {
        super.with(key, value);
        return this;
    }

    @Override
    public boolean isBusinessRule() {
        return true;
    }
}
