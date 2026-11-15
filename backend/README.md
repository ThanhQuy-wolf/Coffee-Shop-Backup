# Drinkool backend

REST API theo [docs/05-api.md](../docs/05-api.md). Một ứng dụng Spring Boot duy nhất,
chia package theo nhóm API.

| Thành phần | Phiên bản |
|---|---|
| Java | 21 |
| Spring Boot | 4.1 (Web MVC, Data JPA, Security + OAuth2 Resource Server, Validation, Flyway, Actuator) |
| PostgreSQL | 17 |
| Test | JUnit 5, MockMvc, Testcontainers |

## Chạy

Bằng Docker, ở thư mục gốc repo (chạy cả PostgreSQL, profile `dev`):

```bash
docker compose up -d --build
curl http://localhost:8080/actuator/health
```

Không qua Docker (sửa code rồi chạy lại nhanh hơn):

```bash
docker compose up -d postgres   # ở thư mục gốc repo
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Frontend (`cd frontend && npm run dev`) gọi backend này qua `/api/*` ở `http://localhost:8080`.

Biến môi trường:

| Biến | Mặc định | Ghi chú |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/drinkool` | |
| `DB_USERNAME`, `DB_PASSWORD` | `drinkool` | |
| `JWT_SECRET` | khoá dev | Production bắt buộc đặt, tối thiểu 32 byte |
| `OTP_FIXED_CODE` | rỗng | Profile `dev` đặt `123456`. Production để trống |
| `PORT` | `8080` | |
| `SPRING_PROFILES_ACTIVE` | rỗng | `compose.yaml` đặt `dev` |

## Dữ liệu

- `src/main/resources/db/migration`: schema (`V1`, chép nguyên DDL ở docs/04-erd.md §3), dòng `shop_info` và 4 bộ phận (`V2`), `combo_item.sort_order` (`V3`), `customer_order.request_fingerprint` cho BR-24 (`V4`). Đã chạy rồi thì không sửa, thêm migration mới.
- `src/main/resources/db/dev`: dữ liệu demo (tài khoản, menu), chỉ chạy ở profile `dev` và trong test. Dữ liệu demo không có đơn và ca làm.

Tài khoản demo: quản lý `admin` / `admin`; nhân viên `an`, `binh`, `cuong` / `123456`;
khách `0987654321` / `user1`. OTP đăng ký ở profile `dev` luôn là `123456`.

## Cấu trúc

```
vn.drinkool
├── common        lỗi problem+json, cấu hình security/JWT, Clock, audit_log (BR-15)
├── auth          A-1 → A-7: đăng nhập, OTP, đăng ký, refresh, /me
├── notification  A-8, A-9
├── shop          S-2 → S-5: thông tin quán, tham số P-06, P-08 → P-12
├── catalog       S-6 menu, C-1 → C-19 quản lý danh mục, món, combo, tuỳ chọn
├── order         O-1 → O-9 đặt đơn, thanh toán, chuyển trạng thái, huỷ; job BR-28
├── report        RP-1 → RP-4 báo cáo doanh thu, món bán, chi phí nhân công
├── review        R-1, R-2 đánh giá đơn
└── shift         W-1 → W-12 ca làm, đăng ký, xin nghỉ, chấm công; job BR-48
```

Quy ước:

- Vi phạm business rule thì ném `BusinessRuleException(status, "BR-xx", title)`. Lỗi chung (`NOT_FOUND`, `VALIDATION`...) dùng `ApiException`. `ProblemHandler` chuyển cả hai thành `application/problem+json` với trường `rule` hoặc `code`.
- Lấy giờ qua bean `Clock` (múi `Asia/Ho_Chi_Minh`), không gọi `Instant.now()`.
- Đổi giá thì gọi `AuditService.priceChanged(...)` trong cùng transaction.
- Quyền theo role khai báo ở `SecurityConfig`. Người đang đăng nhập lấy bằng `CurrentUser.requireId()`.
- Test tích hợp kế thừa `IntegrationTest`: chạy cả app trên Postgres thật, mỗi test rollback sau khi xong.
- Job định kỳ (BR-28, BR-48) tắt bằng `drinkool.jobs.enabled=false`; test tắt sẵn và gọi thẳng `PaymentTimeoutJob.cancelExpired()`, `LeaveExpiryJob.expire()`.
- Thông báo cho nhân viên gửi qua `Notifier.send(...)` trong cùng transaction.
