# 07 — Sequence diagram

Các participant dùng chung:

| Tên | Vai trò |
|---|---|
| `FE` | Frontend Next.js chạy trên trình duyệt |
| `API` | Backend REST (`/api/v1`) |
| `DB` | PostgreSQL |
| `SMS` | Nhà cung cấp SMS gửi OTP |
| `Job` | Tiến trình nền chạy theo lịch |

## 1. Đặt món, mất mạng và gửi lại (UC-07, BR-21 → BR-25)

```mermaid
sequenceDiagram
    autonumber
    actor K as Khách
    participant FE
    participant API
    participant DB

    K->>FE: Bấm "Đặt món" ở /checkout
    FE->>FE: Sinh Idempotency-Key (lưu cùng giỏ)
    FE->>API: POST /orders<br/>Idempotency-Key: k1
    API->>DB: Tìm đơn theo idempotency_key = k1
    DB-->>API: Không có
    API->>DB: Đọc món, combo, tuỳ chọn trong giỏ<br/>và nhóm tuỳ chọn gắn với từng món
    DB-->>API: Trạng thái bán, giá hiện tại, giá chênh

    alt Có món hoặc tuỳ chọn ngừng bán (BR-21)
        API-->>FE: 422 rule BR-21, errors[]
        FE-->>K: Đánh dấu các dòng không còn bán
    else Lựa chọn sai nhóm hoặc sai số lượng (BR-18)
        API-->>FE: 422 rule BR-18, errors[]
        FE-->>K: Mở lại hộp chọn tuỳ chọn của dòng đó
    else Giá đã đổi (BR-22)
        API-->>FE: 409 rule BR-22, currentPrice
        FE-->>K: Cập nhật giá trong giỏ, yêu cầu xác nhận lại
    else Hợp lệ
        API->>DB: BEGIN
        API->>DB: INSERT … ON CONFLICT order_daily_counter<br/>RETURNING last_seq
        DB-->>API: 42
        API->>DB: INSERT customer_order (code DH-260410-0042)
        API->>DB: INSERT order_item (chụp tên, giá, giá vốn đã cộng phần chênh)
        API->>DB: INSERT order_item_option (chụp tên nhóm, tên giá trị, giá chênh)
        API->>DB: INSERT payment (PENDING)
        API->>DB: COMMIT
        API--xFE: 201 bị mất do rớt mạng
    end

    Note over FE: Hết thời gian chờ, thử lại với cùng khoá
    FE->>API: POST /orders<br/>Idempotency-Key: k1
    API->>DB: Tìm đơn theo k1
    DB-->>API: Đơn 5521
    API-->>FE: 200 đơn 5521 (không tạo đơn mới)
    FE->>FE: Xoá giỏ, lưu guestToken
    FE-->>K: Chuyển tới /orders/5521, hiện QR
```

## 2. Theo dõi đơn và nhân viên xác nhận thanh toán (UC-08, UC-10)

```mermaid
sequenceDiagram
    autonumber
    actor K as Khách
    participant FEK as FE khách
    actor NV as Nhân viên
    participant FEN as FE nhân viên
    participant API
    participant DB

    loop Mỗi P-07 giây
        FEK->>API: GET /orders/5521<br/>X-Guest-Token, If-None-Match: "v1"
        API-->>FEK: 304 Not Modified
    end

    K->>NV: Đưa màn hình đã chuyển khoản
    NV->>FEN: Tìm "0042", chọn QR, bấm "Đã thu tiền"
    FEN->>API: POST /orders/5521/payment/confirm<br/>{ method: QR, amount: 149000, version: 1 }
    API->>DB: BEGIN
    API->>DB: UPDATE customer_order SET status = PAID, version = 2<br/>WHERE id = 5521 AND version = 1<br/>AND status = PENDING_PAYMENT
    alt 1 dòng bị cập nhật
        API->>DB: UPDATE payment SET status = CONFIRMED, confirmed_by
        API->>DB: INSERT audit_log
        API->>DB: COMMIT
        API-->>FEN: 200 đơn version 2
        FEN-->>NV: Chuyển thẻ đơn sang cột "Đã thanh toán"
    else 0 dòng (người khác đã xác nhận, hoặc job vừa huỷ)
        API->>DB: ROLLBACK
        API->>DB: Đọc lại đơn
        API-->>FEN: 409 rule BR-26 hoặc BR-27
        FEN-->>NV: Tải lại đơn, hiện trạng thái mới
    end

    FEK->>API: GET /orders/5521, If-None-Match: "v1"
    API-->>FEK: 200 status PAID, ETag "v2"
    FEK-->>K: "Đã nhận thanh toán, quán đang pha chế"
```

## 3. Đăng ký tài khoản bằng OTP (UC-01)

```mermaid
sequenceDiagram
    autonumber
    actor K as Khách
    participant FE
    participant API
    participant DB
    participant SMS

    K->>FE: Nhập 0901234567, bấm "Gửi mã"
    FE->>FE: Kiểm regex BR-01
    FE->>API: POST /auth/otp/request { phone }
    API->>DB: Số đã có tài khoản? Lần gửi gần nhất?
    alt Gửi lại trước P-01 giây
        API-->>FE: 429 rule BR-02, Retry-After
    else Số đã đăng ký
        API-->>FE: 422 rule BR-01
    else Hợp lệ
        API->>DB: INSERT otp_verification (code_hash, expires_at)
        API->>SMS: Gửi mã 6 số
        SMS-->>API: Đã nhận
        API-->>FE: 202 { resendAfter: 60 }
    end

    K->>FE: Nhập OTP, mật khẩu, họ tên
    FE->>API: POST /auth/register
    API->>DB: Lấy OTP mới nhất chưa dùng của số này
    alt Hết hạn hoặc đã sai P-02 lần
        API-->>FE: 422 rule BR-02
    else Sai mã
        API->>DB: attempt_count + 1
        API-->>FE: 422 rule BR-02, remainingAttempts
    else Đúng mã
        API->>DB: BEGIN, INSERT app_user CUSTOMER,<br/>UPDATE otp consumed_at, INSERT refresh_token, COMMIT
        API-->>FE: 201 { accessToken, refreshToken, user }
        FE-->>K: Chuyển tới trang chủ /
    end
```

> Nếu SMS lỗi, API vẫn đã lưu OTP. Nên trả 502 và **không** tính lần gửi đó vào P-01, để khách bấm gửi lại ngay được.

## 4. Đăng nhập nhân viên và làm mới token (UC-02, BR-04)

```mermaid
sequenceDiagram
    autonumber
    actor NV as Nhân viên
    participant FE
    participant API
    participant DB

    NV->>FE: Nhập username, mật khẩu
    FE->>API: POST /auth/staff/login
    API->>DB: Đọc app_user theo username
    alt locked_until > now()
        API-->>FE: 423 rule BR-04, lockedUntil
    else Sai mật khẩu
        API->>DB: failed_login_count + 1,<br/>đủ P-04 lần thì đặt locked_until
        API-->>FE: 401 rule BR-04, remainingAttempts
    else Đúng
        API->>DB: failed_login_count = 0, INSERT refresh_token
        API-->>FE: 200 { accessToken, refreshToken, user }
        FE-->>NV: STAFF → /staff/orders, MANAGER → /manager (FR-04)
    end

    Note over FE,API: 15 phút sau, access token hết hạn
    FE->>API: GET /orders (token cũ)
    API-->>FE: 401 UNAUTHENTICATED
    FE->>API: POST /auth/refresh { refreshToken }
    API->>DB: Thu hồi token cũ, tạo token mới
    API-->>FE: 200 cặp token mới
    FE->>API: Gửi lại GET /orders
    API-->>FE: 200
```

## 5. Hai nhân viên tranh chỗ cuối của một ca (UC-20, BR-43)

```mermaid
sequenceDiagram
    autonumber
    actor A as Nhân viên A
    actor B as Nhân viên B
    participant API
    participant DB

    par Gần như cùng lúc
        A->>API: POST /shifts/88/registrations
    and
        B->>API: POST /shifts/88/registrations
    end

    API->>DB: [A] BEGIN, SELECT shift 88 FOR UPDATE
    DB-->>API: [A] Khoá được
    API->>DB: [B] BEGIN, SELECT shift 88 FOR UPDATE
    Note over DB: B phải chờ A nhả khoá

    API->>DB: [A] Đếm phân ca chiếm chỗ = 2, max_staff = 3
    API->>DB: [A] Kiểm trùng giờ của A (BR-45): không trùng
    API->>DB: [A] INSERT shift_assignment REGISTERED, COMMIT
    API-->>A: 201

    DB-->>API: [B] Khoá được
    API->>DB: [B] Đếm phân ca chiếm chỗ = 3
    API->>DB: [B] ROLLBACK
    API-->>B: 409 rule BR-43
```

## 6. Xin nghỉ, duyệt nghỉ và thông báo (UC-21, BR-42, BR-48)

```mermaid
sequenceDiagram
    autonumber
    actor NV as Nhân viên
    actor QL as Quản lý
    participant API
    participant DB
    participant Job

    NV->>API: POST /shift-assignments/301/leave-request { reason }
    API->>DB: Phân ca REGISTERED và ca chưa bắt đầu?
    alt Không thoả BR-48
        API-->>NV: 422 rule BR-48
    else Thoả
        API->>DB: UPDATE status = LEAVE_REQUESTED, leave_reason
        API-->>NV: 200
    end

    QL->>API: GET /shifts?from=…&to=…
    API-->>QL: Ca 88 có phân ca 301 LEAVE_REQUESTED

    alt Quản lý quyết định trước giờ ca
        QL->>API: POST /shift-assignments/301/leave-decision { approve: true }
        API->>DB: UPDATE status = LEAVE_APPROVED, decided_by, decided_at
        API->>DB: INSERT notification (LEAVE_APPROVED) cho nhân viên
        API-->>QL: 200, ca còn thêm 1 chỗ
    else Tới giờ ca mà chưa ai quyết định
        Job->>DB: UPDATE shift_assignment SET status = REGISTERED<br/>WHERE status = LEAVE_REQUESTED AND ca đã bắt đầu
        Job->>DB: INSERT notification (LEAVE_EXPIRED)
    end

    NV->>API: GET /me/notifications (lần đăng nhập tới)
    API-->>NV: Danh sách thông báo
```

## 7. Báo cáo tổng quan (UC-23, BR-50 → BR-53)

```mermaid
sequenceDiagram
    autonumber
    actor QL as Quản lý
    participant FE
    participant API
    participant DB

    QL->>FE: Mở /manager/analytics, chọn "Tháng"
    par Gọi song song
        FE->>API: GET /reports/summary?period=month
    and
        FE->>API: GET /reports/revenue?period=month
    and
        FE->>API: GET /reports/product-sales?period=month
    end

    API->>DB: Tổng total, đếm đơn WHERE status IN<br/>(PAID, PREPARING, READY, COMPLETED)<br/>AND paid_at trong kỳ này và kỳ trước
    API->>DB: Σ (unit_price − unit_cost) × quantity trên các đơn đó
    DB-->>API: Số liệu hai kỳ
    API->>API: Tính % so với kỳ trước,<br/>kỳ trước = 0 thì trả null (BR-53)
    API-->>FE: summary
    API-->>FE: revenue (chuỗi theo ngày, tỷ trọng danh mục)
    API-->>FE: product-sales (cờ missingCost khi unit_cost = 0)
    FE-->>QL: Hiện thẻ số, biểu đồ, bảng theo món
```
