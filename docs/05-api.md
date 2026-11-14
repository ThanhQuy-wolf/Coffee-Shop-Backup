# 05 — Thiết kế API (REST)

## 1. Quy ước chung

| Mục | Quy ước |
|---|---|
| Base URL | `/api/v1`. Riêng `POST /api/customer/login` giữ nguyên đường dẫn cũ vì frontend đang gọi |
| Hiệu năng | API đọc menu và lịch ca dưới 300 ms, API ghi dưới 500 ms ở p95 (NFR-01) |
| Định dạng | JSON, UTF-8. Tên trường dạng `camelCase` (DB dùng `snake_case`, backend tự ánh xạ) |
| Xác thực | `Authorization: Bearer <accessToken>` (JWT, sống 15 phút). Làm mới bằng refresh token (sống 30 ngày, lưu bản băm trong `refresh_token`) |
| Nội dung JWT | `sub` (user id), `role` (`CUSTOMER` / `STAFF` / `MANAGER`) |
| Khách vãng lai | Không có JWT. Khi tạo đơn nhận `guestToken`, gửi lại qua header `X-Guest-Token` để xem hoặc huỷ đúng đơn đó |
| Tiền | Số nguyên, đơn vị đồng (A-8) |
| Thời gian | ISO-8601 có múi giờ, ví dụ `2026-04-10T09:15:00+07:00`. Ngày dạng `YYYY-MM-DD`, giờ dạng `HH:mm` (NFR-06) |
| Phân trang | `?page=1&size=20`. Trả `{ items, page, size, total }` |
| Idempotency | `POST /orders` bắt buộc header `Idempotency-Key` (UUID v4), lưu cùng đơn (BR-24) |
| Optimistic locking | Lệnh chuyển trạng thái đơn và sửa ca gửi `version` trong body. Lệch thì trả 409 (BR-27) |

**Một quán.** Hệ thống chỉ phục vụ một quán (A-5), nên đường dẫn không có `{shopId}` và token không mang `shopId`. Staff và Manager thấy toàn bộ dữ liệu vận hành, chỉ phân biệt theo role.

## 2. Bảng endpoint

Ký hiệu cột **Quyền**: `Public` không cần đăng nhập, `Guest` là khách vãng lai có `X-Guest-Token` của đơn, `C` Customer, `S` Staff, `M` Manager. `S/M` nghĩa là Staff hoặc Manager.

### 2.1 Xác thực và tài khoản

| # | Method | Đường dẫn | Quyền | Mô tả | FR / BR | Hàm frontend |
|---|---|---|---|---|---|---|
| A-1 | POST | `/api/customer/login` | Public | Khách đăng nhập bằng `{ phone, password }` | FR-02, BR-04 | `authService.loginCustomer` |
| A-2 | POST | `/auth/staff/login` | Public | Nhân viên, quản lý đăng nhập bằng `{ username, password }` | FR-02, BR-04 | `authService.loginStaff` |
| A-3 | POST | `/auth/otp/request` | Public | Gửi OTP tới `{ phone }` để đăng ký | FR-01, BR-01, BR-02 | `authService.requestOtp` |
| A-4 | POST | `/auth/register` | Public | `{ phone, otp, password, fullName }`. Tạo tài khoản Customer và trả token | FR-01, BR-01, BR-02 | `authService.register` |
| A-5 | POST | `/auth/refresh` | Public | `{ refreshToken }` → cặp token mới. Refresh token cũ bị thu hồi | FR-03 | `authService.refresh` |
| A-6 | POST | `/auth/logout` | C/S/M | Thu hồi refresh token hiện tại | FR-03 | `authService.logout` |
| A-7 | GET | `/me` | C/S/M | Thông tin người đang đăng nhập | FR-04 | `authService.getMe` |
| A-8 | GET | `/me/notifications` | C/S/M | Thông báo chưa đọc (huỷ ca, gỡ khỏi ca, kết quả duyệt nghỉ) | BR-42 | `notificationService.list` |
| A-9 | POST | `/me/notifications/{id}/read` | C/S/M | Đánh dấu đã đọc | BR-42 | `notificationService.markRead` |

A-1, A-2, A-4 và A-5 cùng trả:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "rt_...",
  "expiresIn": 900,
  "user": { "id": 12, "role": "CUSTOMER", "fullName": "Nguyễn An", "phone": "0901234567" }
}
```

> **Tương thích.** Backend cũ trả thẳng đối tượng `user` cho A-1. Frontend chấp nhận cả hai dạng trong giai đoạn chuyển tiếp: có `accessToken` thì dùng dạng mới, không có thì coi body là `user`.

### 2.2 Quán và menu

| # | Method | Đường dẫn | Quyền | Mô tả | FR / BR | Hàm frontend |
|---|---|---|---|---|---|---|
| S-2 | GET | `/shop` | Public | Thông tin quán (tên, địa chỉ, giờ mở cửa, ảnh) | FR-06 | `shopService.get` |
| S-3 | PUT | `/shop` | M | Sửa thông tin quán | FR-10 | `shopService.update` |
| S-4 | GET | `/shop/settings` | M | Đọc tham số của quán (P-06, P-08 đến P-12) | — | `shopService.getSettings` |
| S-5 | PUT | `/shop/settings` | M | Sửa tham số của quán | — | `shopService.updateSettings` |
| S-6 | GET | `/menu` | Public | Menu cho khách: danh mục, món và combo **đang bán**, có `?q=` để tìm theo tên và mô tả. Mỗi món có `optionGroupIds` theo thứ tự hiển thị, và response kèm `optionGroups` (nhóm cùng giá trị). Giá trị tạm hết vẫn trả về với `isAvailable: false` để giao diện hiện "Hết". Món có nhóm bắt buộc không đủ giá trị đang bán thì không có trong menu (BR-19) | FR-06, FR-35, BR-13, BR-19 | `catalogService.getMenu` |

S-1 (danh sách quán) đã bỏ khi hệ thống chuyển sang một quán. Mã S-1 không dùng lại.

### 2.3 Quản lý danh mục, món, combo

Các endpoint `GET` ở đây trả cả món đang tắt bán, khác với S-6.

| # | Method | Đường dẫn | Quyền | Mô tả | FR / BR | Hàm frontend |
|---|---|---|---|---|---|---|
| C-1 | GET | `/categories` | S/M | Danh sách danh mục, kèm số món | FR-07 | `catalogService.listCategories` |
| C-2 | POST | `/categories` | M | Tạo danh mục `{ name, icon, sortOrder }` | FR-07 | `catalogService.createCategory` |
| C-3 | PUT | `/categories/{categoryId}` | M | Sửa danh mục | FR-07 | `catalogService.updateCategory` |
| C-4 | DELETE | `/categories/{categoryId}` | M | Xoá mềm danh mục rỗng | FR-07, BR-11 | `catalogService.deleteCategory` |
| C-5 | GET | `/products?categoryId=` | S/M | Danh sách món | FR-08 | `catalogService.listProducts` |
| C-6 | POST | `/products` | M | Tạo món. Body có `optionGroupIds` (thứ tự trong mảng là thứ tự hiển thị) | FR-08, FR-34, BR-10, BR-12 | `catalogService.createProduct` |
| C-7 | PUT | `/products/{productId}` | M | Sửa món, kể cả `optionGroupIds`. Đổi giá thì ghi `audit_log` | FR-08, FR-34, BR-10, BR-12, BR-15 | `catalogService.updateProduct` |
| C-8 | PATCH | `/products/{productId}/availability` | S/M | Bật/tắt bán `{ isAvailable }`. Nhân viên được tắt khi hết nguyên liệu | FR-08, BR-13 | `catalogService.setProductAvailability` |
| C-9 | DELETE | `/products/{productId}` | M | Xoá món (mềm nếu đã bán) | FR-08, BR-14 | `catalogService.deleteProduct` |
| C-10 | GET | `/combos` | S/M | Danh sách combo, kèm cờ `sellable` tính từ món thành phần | FR-09, BR-13 | `catalogService.listCombos` |
| C-11 | POST | `/combos` | M | Tạo combo `{ name, price, items: [{ productId, quantity }] }` | FR-09, BR-13 | `catalogService.createCombo` |
| C-12 | PUT | `/combos/{comboId}` | M | Sửa combo | FR-09, BR-13, BR-15 | `catalogService.updateCombo` |
| C-13 | PATCH | `/combos/{comboId}/availability` | M | Bật/tắt bán combo | FR-09 | `catalogService.setComboAvailability` |
| C-14 | DELETE | `/combos/{comboId}` | M | Xoá combo (mềm nếu đã bán) | FR-09, BR-14 | `catalogService.deleteCombo` |
| C-15 | GET | `/option-groups` | S/M | Danh sách nhóm tuỳ chọn kèm giá trị và `productCount` (số món đang gắn) | FR-34 | `catalogService.listOptionGroups` |
| C-16 | POST | `/option-groups` | M | Tạo nhóm kèm giá trị, xem body bên dưới | FR-34, BR-16, BR-17 | `catalogService.createOptionGroup` |
| C-17 | PUT | `/option-groups/{groupId}` | M | Sửa nhóm và cả danh sách giá trị. Giá trị có `id` thì sửa, không có thì thêm, thiếu thì xoá (mềm nếu đã bán). Đổi giá chênh thì ghi `audit_log` | FR-34, BR-16, BR-17, BR-19 | `catalogService.updateOptionGroup` |
| C-18 | DELETE | `/option-groups/{groupId}` | M | Xoá nhóm (mềm nếu đã bán). Nhóm còn gắn vào món thì trả 422 `BR-19` | FR-34, BR-19 | `catalogService.deleteOptionGroup` |
| C-19 | PATCH | `/option-values/{valueId}/availability` | S/M | Bật/tắt một giá trị `{ isAvailable }`. Nhân viên được tắt khi hết nguyên liệu | FR-34, BR-19 | `catalogService.setOptionValueAvailability` |

**C-16 — request**

```json
{
  "name": "Size",
  "selectionType": "SINGLE",
  "minSelect": 1,
  "maxSelect": 1,
  "sortOrder": 0,
  "values": [
    { "name": "M", "priceDelta": 0, "costDelta": 0, "isDefault": true },
    { "name": "L", "priceDelta": 6000, "costDelta": 2500, "isDefault": false }
  ]
}
```

### 2.4 Đơn hàng và thanh toán

| # | Method | Đường dẫn | Quyền | Mô tả | FR / BR | Hàm frontend |
|---|---|---|---|---|---|---|
| O-1 | POST | `/orders` | Public, C | Tạo đơn. Header `Idempotency-Key` | FR-12, FR-13, FR-36, FR-37, BR-18, BR-21 → BR-25 | `orderService.create` |
| O-2 | GET | `/orders/{orderId}` | Guest, C, S/M | Chi tiết đơn, kèm thanh toán và đánh giá (nếu có). Màn hình khách gọi lại mỗi P-07 giây | FR-14 | `orderService.get` |
| O-3 | GET | `/me/orders` | C | Lịch sử đơn của khách, mới nhất trước | FR-15 | `orderService.listMine` |
| O-4 | GET | `/orders?status=&q=&date=` | S/M | Hàng đợi đơn của quán. `q` tìm theo mã đơn. Số điện thoại khách chỉ trả 3 số cuối (NFR-07) | FR-16 | `orderService.listQueue` |
| O-5 | POST | `/orders/{orderId}/payment/confirm` | S/M | `{ method, amount, version }`. Đơn sang `PAID`, thanh toán sang `CONFIRMED` | FR-17, BR-26, BR-27 | `orderService.confirmPayment` |
| O-6 | POST | `/orders/{orderId}/start` | S/M | `{ version }`. `PAID` → `PREPARING` | FR-17, BR-27 | `orderService.start` |
| O-7 | POST | `/orders/{orderId}/ready` | S/M | `{ version }`. `PREPARING` → `READY` | FR-17, BR-27 | `orderService.markReady` |
| O-8 | POST | `/orders/{orderId}/complete` | S/M | `{ version }`. `READY` → `COMPLETED` | FR-17, BR-27 | `orderService.complete` |
| O-9 | POST | `/orders/{orderId}/cancel` | Guest, C, S/M | `{ version, reason }`. Phân quyền theo trạng thái, xem bên dưới | FR-18, BR-27, BR-29 | `orderService.cancel` |

**Ai được huỷ đơn (O-9)**

| Trạng thái đơn | Khách (chủ đơn) | Staff | Manager | Kết quả thanh toán |
|---|---|---|---|---|
| `PENDING_PAYMENT` | Được | Được | Được | `VOIDED` |
| `PAID`, `PREPARING` | Không | Không | Được, bắt buộc `reason` | `REFUNDED` (hoàn ngoài hệ thống) |
| `READY`, `COMPLETED`, `CANCELLED` | Không | Không | Không | — |

Trường hợp không được huỷ trả 403 `BR-29` nếu sai role, 409 `ORDER_STATE` nếu sai trạng thái.

**O-1 — request**

```http
POST /api/v1/orders
Idempotency-Key: 6f1c2a8e-6b1d-4c55-9a0e-3d7f2b9e1c44
Authorization: Bearer eyJ...      (không bắt buộc)
```

```json
{
  "paymentMethod": "QR",
  "tableLabel": "B05",
  "note": "Ít đá",
  "items": [
    { "type": "PRODUCT", "id": 101, "quantity": 2, "unitPrice": 35000, "optionValueIds": [] },
    { "type": "PRODUCT", "id": 104, "quantity": 1, "unitPrice": 46000, "optionValueIds": [2, 7, 11] },
    {
      "type": "COMBO", "id": 7, "quantity": 1, "unitPrice": 85000,
      "components": [{ "no": 1, "optionValueIds": [2, 7, 9] }]
    }
  ]
}
```

`unitPrice` là giá khách đang thấy, đã cộng giá chênh của các tuỳ chọn. Backend dùng nó để kiểm BR-22, không dùng để tính tiền. `optionValueIds` chỉ có ở dòng `PRODUCT`. Dòng `COMBO` gửi `components`: mỗi phần tử là lựa chọn của một ly, `no` đếm từ 1 theo thứ tự món và số lượng trong combo. Ví dụ combo gồm 1 Bạc xỉu + 1 Bánh mì thì `no` 1 là Bạc xỉu, `no` 2 là Bánh mì. Ly không có nhóm tuỳ chọn thì bỏ qua (BR-18, FR-37).

**O-1 — response 201**

```json
{
  "id": 5521,
  "code": "DH-260410-0042",
  "status": "PENDING_PAYMENT",
  "total": 201000,
  "version": 1,
  "guestToken": "gt_9QhX...",
  "paymentDeadline": "2026-04-10T09:30:00+07:00",
  "payment": { "method": "QR", "status": "PENDING", "amount": 201000, "transferContent": "DH-260410-0042" },
  "items": [
    { "type": "PRODUCT", "id": 101, "name": "Bạc xỉu", "unitPrice": 35000, "quantity": 2, "lineTotal": 70000, "options": [] },
    {
      "type": "PRODUCT", "id": 104, "name": "Trà sữa", "unitPrice": 46000, "quantity": 1, "lineTotal": 46000,
      "options": [
        { "optionValueId": 2, "groupName": "Size", "valueName": "Size L", "priceDelta": 6000 },
        { "optionValueId": 7, "groupName": "Mức đường", "valueName": "50% đường", "priceDelta": 0 },
        { "optionValueId": 11, "groupName": "Topping", "valueName": "Trân châu đen", "priceDelta": 5000 }
      ]
    },
    {
      "type": "COMBO", "id": 7, "name": "Combo sáng", "unitPrice": 85000, "quantity": 1, "lineTotal": 85000,
      "options": [
        { "componentNo": 1, "componentName": "Bạc xỉu", "optionValueId": 2, "groupName": "Size", "valueName": "Size L", "priceDelta": 6000 },
        { "componentNo": 1, "componentName": "Bạc xỉu", "optionValueId": 7, "groupName": "Mức đường", "valueName": "50% đường", "priceDelta": 0 },
        { "componentNo": 1, "componentName": "Bạc xỉu", "optionValueId": 9, "groupName": "Mức đá", "valueName": "Ít đá", "priceDelta": 0 }
      ]
    }
  ],
  "createdAt": "2026-04-10T09:15:00+07:00"
}
```

`guestToken` chỉ có khi người đặt chưa đăng nhập. Gửi lại cùng `Idempotency-Key` thì nhận 200 với đúng đơn này. Gửi cùng khoá nhưng nội dung giỏ khác thì nhận 422 `BR-24`.

### 2.5 Đánh giá

| # | Method | Đường dẫn | Quyền | Mô tả | FR / BR | Hàm frontend |
|---|---|---|---|---|---|---|
| R-1 | POST | `/orders/{orderId}/review` | C | `{ rating, comment }` | FR-20, BR-30, BR-31 | `reviewService.create` |
| R-2 | GET | `/reviews?rating=&page=` | M | Danh sách đánh giá, kèm `average` và số lượng theo từng mức sao | FR-21 | `reviewService.list` |

### 2.6 Ca làm

| # | Method | Đường dẫn | Quyền | Mô tả | FR / BR | Hàm frontend |
|---|---|---|---|---|---|---|
| W-1 | GET | `/departments` | S/M | Danh sách bộ phận | FR-22 | `shiftService.listDepartments` |
| W-2 | GET | `/staff` | M | Nhân viên của quán (để chấm công, gỡ khỏi ca) | FR-28, FR-29 | `shiftService.listStaff` |
| W-3 | GET | `/shifts?from=&to=&departmentId=` | S/M | Ca trong khoảng ngày, kèm danh sách phân ca, `occupied` và `remaining` | FR-22 | `shiftService.listShifts` |
| W-4 | POST | `/shifts` | M | Tạo ca `{ departmentId, date, startTime, endTime, wage, maxStaff, allowCrossDepartment }` | FR-23, BR-40, BR-41 | `shiftService.createShift` |
| W-5 | PUT | `/shifts/{shiftId}` | M | Sửa ca `{ ..., version }` | FR-24, BR-40, BR-41, BR-42 | `shiftService.updateShift` |
| W-6 | POST | `/shifts/{shiftId}/cancel` | M | Huỷ ca `{ reason, version }`. Mọi phân ca sang `CANCELLED`, gửi thông báo | FR-24, BR-42 | `shiftService.cancelShift` |
| W-7 | POST | `/shifts/{shiftId}/registrations` | S/M | Đăng ký ca cho chính mình | FR-25, BR-43 → BR-46 | `shiftService.register` |
| W-8 | DELETE | `/shifts/{shiftId}/registrations/me` | S/M | Tự huỷ đăng ký | FR-26, BR-47 | `shiftService.unregister` |
| W-9 | POST | `/shift-assignments/{assignmentId}/leave-request` | S/M | `{ reason }`. Chỉ chủ phân ca | FR-27, BR-48 | `shiftService.requestLeave` |
| W-10 | POST | `/shift-assignments/{assignmentId}/leave-decision` | M | `{ approve: true \| false }` | FR-27, BR-48 | `shiftService.decideLeave` |
| W-11 | POST | `/shift-assignments/{assignmentId}/attendance` | M | `{ status: "ATTENDED" \| "ABSENT" }` | FR-28, BR-49 | `shiftService.markAttendance` |
| W-12 | DELETE | `/shift-assignments/{assignmentId}` | M | Gỡ nhân viên khỏi ca. Phân ca sang `CANCELLED`, gửi thông báo | FR-29, BR-42 | `shiftService.removeAssignment` |

> W-6 dùng `POST /cancel` thay cho `DELETE /shifts/{id}` vì ca không bị xoá: nó chuyển sang `CANCELLED` và vẫn giữ lịch sử phân ca. Dùng `DELETE` dễ khiến người đọc hiểu là xoá hẳn.

**W-3 — một phần tử trong response**

```json
{
  "id": 88,
  "departmentId": 2,
  "date": "2026-04-12",
  "startTime": "07:00",
  "endTime": "11:00",
  "wage": 120000,
  "maxStaff": 3,
  "allowCrossDepartment": false,
  "status": "OPEN",
  "version": 4,
  "occupied": 2,
  "remaining": 1,
  "assignments": [
    { "id": 301, "staffId": 21, "staffName": "Trần Bình", "status": "REGISTERED" },
    { "id": 305, "staffId": 25, "staffName": "Lê Chi", "status": "LEAVE_REQUESTED", "leaveReason": "Thi cuối kỳ" }
  ]
}
```

### 2.7 Báo cáo

Tất cả chỉ dành cho Manager của quán. `period` nhận `day`, `week`, `month`, `year`. `date` là một ngày bất kỳ trong kỳ, mặc định hôm nay.

| # | Method | Đường dẫn | Mô tả | FR / BR | Hàm frontend |
|---|---|---|---|---|---|
| RP-1 | GET | `/reports/summary?period=&date=` | Doanh thu, số đơn, lợi nhuận gộp, giá trị đơn trung bình, và `% so với kỳ trước` (null nếu kỳ trước bằng 0) | FR-30, BR-50, BR-51, BR-53 | `analyticsService.getSummary` |
| RP-2 | GET | `/reports/revenue?period=&date=` | Chuỗi doanh thu theo mốc thời gian, so sánh hai nửa kỳ, tỷ trọng theo danh mục | FR-31, BR-50 | `analyticsService.getRevenue` |
| RP-3 | GET | `/reports/product-sales?period=&date=&categoryId=` | Bảng theo món: số lượng, doanh thu, giá vốn, lợi nhuận, biên. Món chưa có giá vốn có cờ `missingCost` | FR-32, BR-51, BR-10 | `analyticsService.getProductSales` |
| RP-4 | GET | `/reports/labor-cost?weekStart=` | Chi phí nhân công theo tuần, tách theo bộ phận | FR-33, BR-52 | `analyticsService.getLaborCost` |

## 3. Lỗi

Mọi lỗi trả `Content-Type: application/problem+json` (RFC 9457, NFR-04):

```json
{
  "type": "https://drinkool.vn/problems/business-rule",
  "title": "Có món không còn bán",
  "status": 422,
  "rule": "BR-21",
  "detail": "2 dòng trong giỏ có món hoặc tuỳ chọn đã ngừng bán",
  "errors": [
    { "line": 0, "itemType": "PRODUCT", "id": 101, "reason": "UNAVAILABLE" },
    { "line": 1, "itemType": "PRODUCT", "id": 104, "optionValueId": 11, "reason": "OPTION_UNAVAILABLE" }
  ]
}
```

Với lỗi của O-1 (`BR-18`, `BR-21`, `BR-22`), mỗi phần tử trong `errors[]` có `line` là vị trí dòng trong `items` của request. Một món có thể nằm ở nhiều dòng với tuỳ chọn khác nhau, nên `itemType` và `id` không đủ để chỉ ra dòng nào. Lỗi `BR-18` có thêm `groupId` (0 nếu không thuộc nhóm nào) và `message`. Lỗi ở một ly trong combo có thêm `componentNo`.

Frontend chọn thông báo theo `rule` (hoặc `code` khi không gắn với BR), không theo `title`.

| HTTP | `rule` / `code` | Khi nào |
|---|---|---|
| 400 | `VALIDATION` | Sai kiểu dữ liệu, thiếu trường bắt buộc. `errors[]` liệt kê từng trường |
| 401 | `UNAUTHENTICATED` | Thiếu hoặc hết hạn token. Frontend thử A-5 một lần rồi mới đưa về `/login` |
| 401 | `BR-04` | Sai mật khẩu. Body có `remainingAttempts` |
| 423 | `BR-04` | Tài khoản đang bị khoá. Body có `lockedUntil` |
| 403 | `FORBIDDEN` | Sai role |
| 404 | `NOT_FOUND` | Không có tài nguyên, hoặc khách vãng lai gửi sai `X-Guest-Token` (không lộ việc đơn tồn tại) |
| 409 | `BR-22` | Giá đã đổi. `errors[]` có `currentPrice` từng mục |
| 409 | `BR-27` | Lệch `version`. Body có `currentVersion` |
| 409 | `ORDER_STATE` | Chuyển trạng thái đơn không hợp lệ (ví dụ `start` khi đơn chưa `PAID`) |
| 409 | `BR-43` | Ca đã đủ người |
| 409 | `BR-44` | Đã có phân ca hiệu lực trong ca này |
| 409 | `BR-26` | Xác nhận thanh toán cho đơn không còn `PENDING_PAYMENT` (đã huỷ hoặc đã có người xác nhận) |
| 409 | `BR-12` | Trùng tên món |
| 409 | `BR-16` | Trùng tên nhóm tuỳ chọn, hoặc trùng tên giá trị trong một nhóm |
| 422 | `BR-xx` khác | Vi phạm rule nghiệp vụ còn lại (BR-01, 02, 10, 11, 13, 16 → 19, 21, 23, 24, 26 khi số tiền lệch, 30, 31, 40–42, 45–49) |
| 429 | `BR-02` | Yêu cầu OTP quá sớm. Header `Retry-After` |
| 500 | `INTERNAL` | Lỗi hệ thống. Body có `traceId`, không lộ chi tiết |

## 4. Ghi chú triển khai

- **Đếm chỗ khi đăng ký ca (W-7).** Trong cùng transaction: `SELECT … FROM shift WHERE id = ? FOR UPDATE`, đếm phân ca chiếm chỗ, kiểm trùng giờ của nhân viên, rồi `INSERT`. Unique index một phần `uq_assignment_active` là lưới an toàn cuối cho BR-44.
- **Chuyển trạng thái đơn.** `UPDATE customer_order SET status = ?, version = version + 1 WHERE id = ? AND version = ? AND status = ?`. Không có dòng nào bị ảnh hưởng thì đọc lại đơn để phân biệt `BR-27` (lệch version) với `ORDER_STATE` (sai trạng thái).
- **Job huỷ đơn quá hạn (BR-28).** Chạy mỗi phút với câu lệnh có điều kiện `status = 'PENDING_PAYMENT' AND created_at < now() - interval`. Chạy hai lần cũng không sao vì lần sau không còn dòng nào thoả. Thời hạn đọc từ `shop_info.payment_timeout_minutes`.
- **Job trả phân ca về `REGISTERED` (BR-48).** Cũng chạy mỗi phút, chuyển các phân ca `LEAVE_REQUESTED` của ca đã bắt đầu.
- **Polling (FR-14).** O-2 trả header `ETag` theo `version`. Frontend gửi `If-None-Match`, không đổi thì nhận 304, nhẹ cho cả hai phía.
