-- Thứ tự ly của combo demo, giống thứ tự `items` trong frontend/lib/mock-data/menu.ts
UPDATE combo_item SET sort_order = CASE WHEN product_id IN (1, 5, 2) THEN 0 ELSE 1 END;
