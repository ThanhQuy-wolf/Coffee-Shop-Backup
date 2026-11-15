-- R-37: thứ tự món trong combo quyết định số `no` của từng ly khi đặt (A-10)
ALTER TABLE combo_item ADD COLUMN sort_order int NOT NULL DEFAULT 0;
