package vn.drinkool.catalog;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

/**
 * Trả lời "đã có đơn hoặc dữ liệu nào trỏ tới chưa" để chọn xoá mềm hay xoá cứng (BR-14, BR-19, R-38, R-39).
 * Đọc thẳng bảng của module đơn hàng bằng SQL để catalog không phụ thuộc entity của đơn.
 */
@Component
class SalesHistory {

    private final JdbcClient jdbc;

    SalesHistory(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    boolean productReferenced(long productId) {
        return exists("""
                SELECT EXISTS (SELECT 1 FROM order_item WHERE product_id = :id)
                    OR EXISTS (SELECT 1 FROM order_item_option WHERE component_product_id = :id)
                    OR EXISTS (SELECT 1 FROM combo_item WHERE product_id = :id)""", productId);
    }

    boolean comboSold(long comboId) {
        return exists("SELECT EXISTS (SELECT 1 FROM order_item WHERE combo_id = :id)", comboId);
    }

    boolean optionValueSold(long valueId) {
        return exists("SELECT EXISTS (SELECT 1 FROM order_item_option WHERE option_value_id = :id)", valueId);
    }

    boolean optionGroupReferenced(long groupId) {
        return exists("""
                SELECT EXISTS (SELECT 1 FROM order_item_option WHERE option_group_id = :id)
                    OR EXISTS (SELECT 1 FROM product_option_group WHERE option_group_id = :id)""", groupId);
    }

    private boolean exists(String sql, long id) {
        return Boolean.TRUE.equals(jdbc.sql(sql).param("id", id).query(Boolean.class).single());
    }
}
