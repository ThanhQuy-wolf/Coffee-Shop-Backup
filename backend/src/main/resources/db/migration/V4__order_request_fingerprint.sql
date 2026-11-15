-- R-42: BR-24 cần biết request gửi lại cùng Idempotency-Key có đúng giỏ cũ không.
-- DEFAULT '' cho đơn không tạo qua O-1 (nhập tay, dữ liệu cũ): '' không khớp dấu SHA-256 nào, nên gửi lại khoá đó nhận BR-24.
ALTER TABLE customer_order ADD COLUMN request_fingerprint varchar(64) NOT NULL DEFAULT '';
