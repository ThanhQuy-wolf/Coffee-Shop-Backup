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

> **Tương thích.** Backend cũ trả thẳng đối tượng `user` cho A-1. Từ đợt 5 frontend chỉ nhận dạng mới (có `accessToken`), là dạng backend trong `backend/` trả.

**Chi tiết của nhóm A**

- A-4 trả `201 Created` cùng body như trên.
- A-5 xoay vòng token: refresh token cũ bị thu hồi ngay. Nếu một refresh token **đã thu hồi** bị gửi lại thì coi như token đã lộ, backend thu hồi mọi phiên của người đó và trả 401 `UNAUTHENTICATED`.
- A-6 nhận body tuỳ chọn `{ refreshToken }` và trả `204 No Content`. Có `refreshToken` thì chỉ thu hồi phiên đó, không gửi thì thu hồi mọi phiên của người dùng.
- A-8 trả mảng `{ id, type, message, readAt, createdAt }`, mới nhất trước. `message` lấy từ `notification.payload.message`, câu do service tạo thông báo viết sẵn.
- A-9 trả `204 No Content`. Id của người khác bị bỏ qua, không trả 404.
- Sai mật khẩu ở lần thứ P-04 trả luôn 423 `BR-04` kèm `lockedUntil`, không trả 401 nữa.

### 2.2 Quán và menu

| # | Method | Đường dẫn | Quyền | Mô tả | FR / BR | Hàm frontend |
|---|---|---|---|---|---|---|
| S-2 | GET | `/shop` | Public | Thông tin quán (tên, địa chỉ, giờ mở cửa, ảnh) | FR-06 | `shopService.get` |
| S-3 | PUT | `/shop` | M | Sửa thông tin quán | FR-10 | `shopService.update` |
| S-4 | GET | `/shop/settings` | M | Đọc tham số của quán (P-06, P-08 đến P-12) | — | `shopService.getSettings` |
| S-5 | PUT | `/shop/settings` | M | Sửa tham số của quán | — | `shopService.updateSettings` |
| S-6 | GET | `/menu` | Public | Menu cho khách: danh mục, món và combo **đang bán**, có `?q=` để tìm theo tên và mô tả. Mỗi món có `optionGroupIds` theo thứ tự hiển thị, và response kèm `optionGroups` (chỉ các nhóm mà món hoặc ly trong combo của menu đang dùng, cùng giá trị). Giá trị tạm hết vẫn trả về với `isAvailable: false` để giao diện hiện "Hết". Món có nhóm bắt buộc không đủ giá trị đang bán thì không có trong menu (BR-19). Menu công khai **không** trả `costPrice` và `costDelta`: giá vốn là số liệu nội bộ, chỉ có ở C-5, C-15 | FR-06, FR-35, BR-13, BR-19 | `catalogService.getMenu` |

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

**Chi tiết của nhóm C**

- Body của C-6, C-7 là `{ categoryId, name, description, price, costPrice, imageUrl, isAvailable, optionGroupIds }`. Body của C-11, C-12 là `{ name, description, price, imageUrl, isAvailable, items }`. Body của C-16, C-17 như ví dụ trên, C-17 thêm `id` cho giá trị đã có.
- Thứ tự phần tử trong `items` của C-11, C-12 được lưu vào `combo_item.sort_order` và quyết định số `no` của từng ly khi đặt combo (A-10). C-10 và S-6 trả `items` theo đúng thứ tự đó. Một món chỉ xuất hiện một lần trong `items`, muốn 2 ly thì đặt `quantity: 2`.
- Giá bán ≤ 0 hoặc giá vốn âm trả 422 `BR-10`. Giá chênh âm trả 422 `BR-17`. Thiếu tên trả 400 `VALIDATION`. Tên danh mục trùng (không phân biệt hoa thường) trả 400 `VALIDATION`, vì chưa có BR cho tên danh mục.
- Danh mục, món, nhóm tuỳ chọn được tham chiếu mà không tồn tại hoặc đã xoá thì trả 404 `NOT_FOUND`.
- Các lệnh `DELETE` trả `204 No Content`. Xoá mềm hay cứng theo BR-14, BR-19 (xem [04-erd.md §4](04-erd.md#4-ràng-buộc-không-biểu-diễn-được-bằng-ddl)), client không cần phân biệt.
- C-8, C-13, C-19 trả lại món, combo hoặc giá trị sau khi đổi.
- Đổi `price`, `costPrice` của món, `price` của combo, `priceDelta`, `costDelta` của giá trị đều ghi một dòng `audit_log` với `action` = `PRICE_CHANGED`, `before_data` và `after_data` chứa các giá cũ, mới (BR-15, BR-17).

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

`unitPrice` là giá khách đang thấy, đã cộng giá chênh của các tuỳ chọn. Backend dùng nó để kiểm BR-22, không dùng để tính tiền. `optionValueIds` chỉ có ở dòng `PRODUCT`. Dòng `COMBO` gửi `components`: mỗi phần tử là lựa chọn của một ly, `no` đếm từ 1 theo thứ tự món (`items` của combo, xem C-11) và số lượng trong combo. Ví dụ combo gồm 1 Bạc xỉu + 1 Bánh mì thì `no` 1 là Bạc xỉu, `no` 2 là Bánh mì. Ly không có nhóm tuỳ chọn thì bỏ qua (BR-18, FR-37).

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

`guestToken` chỉ có khi người đặt chưa đăng nhập. Gửi lại cùng `Idempotency-Key` thì nhận 200 với đúng đơn này. Gửi cùng khoá nhưng nội dung giỏ khác (hoặc người đặt khác) thì nhận 422 `BR-24`.

**Chi tiết của nhóm O**

- O-1: thiếu `Idempotency-Key` hoặc khoá dài quá 64 ký tự trả 400 `VALIDATION`. Token của Staff, Manager trả 403 `FORBIDDEN`, vì nhân viên không đặt món bằng tài khoản nhân viên. Lỗi kiểm theo thứ tự: `BR-23` (giỏ rỗng, số lượng ngoài `[1, P-08]`) dừng ngay, rồi gom hết `BR-21`, nếu không có thì gom `BR-18`, cuối cùng mới tới `BR-22`.
- O-1: dòng `COMBO` gửi `optionValueIds` không rỗng trả 422 `BR-18` với `groupId` 0. Giá trị tuỳ chọn tắt bán hoặc đã xoá trả `BR-21` với `reason` = `OPTION_UNAVAILABLE`, không trả `BR-18`.
- Response của O-1 → O-9 là cùng một kiểu `Order`: các trường như ví dụ ở trên, thêm `tableLabel`, `note`, `customerId`, `customerPhone`, `review`, `paidAt`, `completedAt`, `cancelledAt`, `cancelReason`. `payment` có thêm `confirmedAt`. Response không có giá vốn.
- `customerPhone` đủ 10 số khi người xem là chính khách đặt, còn lại chỉ hiện 3 số cuối dạng `*******321` (NFR-07).
- O-2 nhận khách vãng lai qua header `X-Guest-Token`. Sai token, hoặc khách hàng xem đơn của người khác, đều trả 404 `NOT_FOUND`. Response có `ETag: "<version>-<reviewId hoặc 0>"`. Gửi `If-None-Match` trùng thì nhận 304 không body.
- O-3 trả mảng tối đa 50 đơn gần nhất, mới nhất trước.
- O-4 trả mảng, cũ nhất trước (đơn chờ lâu nằm đầu hàng). `status` nhận nhiều giá trị cách nhau bởi dấu phẩy, `q` tìm theo một phần mã đơn, `date` (`YYYY-MM-DD`, theo giờ quán) lọc theo ngày tạo. Không gửi gì thì trả mọi đơn của hôm nay.
- O-5 → O-9 kiểm `version` trước tiên: lệch thì trả 409 `BR-27` kèm `currentVersion`, kể cả khi trạng thái cũng sai. Hai người bấm cùng lúc mà lọt qua bước kiểm này thì lệnh ghi sau cũng nhận `BR-27`.
- O-5 cập nhật `payment.method` theo phương thức nhân viên chọn (UC-07 luồng 7a), ghi `paid_at`, `confirmed_by`.
- O-9 không gửi `reason` thì lưu `Khách huỷ` hoặc `Nhân viên huỷ`. Job BR-28 lưu `PAYMENT_TIMEOUT`.
- Xác nhận thanh toán và huỷ đơn đã thanh toán ghi `audit_log` với `action` lần lượt là `PAYMENT_CONFIRMED` và `ORDER_REFUNDED` (NFR-03).

### 2.5 Đánh giá

| # | Method | Đường dẫn | Quyền | Mô tả | FR / BR | Hàm frontend |
|---|---|---|---|---|---|---|
| R-1 | POST | `/orders/{orderId}/review` | C | `{ rating, comment }` | FR-20, BR-30, BR-31 | `reviewService.create` |
| R-2 | GET | `/reviews?rating=&page=` | M | Danh sách đánh giá, kèm `average` và số lượng theo từng mức sao | FR-21 | `reviewService.list` |

**Chi tiết của nhóm R**

- R-1 trả 201 với kiểu `Review`: `{ id, orderId, orderCode, customerName, rating, comment, createdAt }`. Trường `review` của O-2 → O-9 cũng dùng kiểu này.
- R-1 đơn không tồn tại trả 404. Đơn của người khác, đơn chưa `COMPLETED` hoặc quá P-09 ngày trả 422 `BR-30`. Đã có đánh giá, `rating` ngoài 1–5 hoặc `comment` quá 500 ký tự trả 422 `BR-31`. `comment` rỗng lưu thành `null`.
- R-2 trả `{ items, page, size, total, average, countByRating }`, mới nhất trước. `page` mặc định 1, `size` mặc định 20 và tối đa 100. `average` và `countByRating` (khoá `"1"` → `"5"`) tính trên mọi đánh giá, không theo bộ lọc `rating`.

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

**Chi tiết của nhóm W**

- W-4 → W-12 trả kiểu `Shift` như ví dụ trên (W-4 trả 201). `date` dạng `YYYY-MM-DD`, `startTime`, `endTime` dạng `HH:mm` theo giờ quán. `assignments` bỏ phân ca `CANCELLED`, giữ `LEAVE_APPROVED` để quản lý thấy ai đã được nghỉ. Mỗi phần tử có `id`, `shiftId`, `staffId`, `staffName`, `status`, `leaveReason`.
- W-1 trả mảng `{ id, code, name, icon }`. W-2 trả mảng `{ id, fullName, role, departmentId }` của mọi tài khoản Staff và Manager.
- W-3 bắt buộc `from` và `to`, thiếu hoặc sai định dạng trả 400 `VALIDATION`. Sắp theo ngày rồi giờ bắt đầu.
- W-4, W-5: giờ kết thúc không sau giờ bắt đầu trả 422 `BR-40`. `maxStaff` ngoài 1–20, `wage` ≤ 0, hoặc `maxStaff` thấp hơn số người đang chiếm chỗ trả 422 `BR-41`. Bộ phận không tồn tại trả 422 `VALIDATION`. Đổi giờ làm một người trong ca bị trùng ca khác của họ trả 422 `BR-42`.
- W-5, W-6 kiểm `version` trước tiên (409 `BR-27` kèm `currentVersion`). Sửa hoặc huỷ ca đã huỷ trả 409 `ORDER_STATE`, giống frontend. Huỷ ca đã bắt đầu trả 422 `BR-42`.
- W-7 kiểm theo thứ tự `BR-46` (422), `BR-44` (409), `BR-43` (409), `BR-45` (422). Manager đăng ký được ca của mọi bộ phận. Backend khoá dòng ca và dòng nhân viên (`FOR UPDATE`) trong lúc kiểm, nên hai người tranh chỗ cuối, hay một người đăng ký hai ca trùng giờ cùng lúc, đều chỉ một lệnh thành công.
- W-8 chỉ huỷ được phân ca `REGISTERED` của chính mình (không có thì 404), còn ít hơn P-10 giờ thì 422 `BR-47`.
- W-9 phân ca của người khác trả 403 `FORBIDDEN`. Thiếu lý do, phân ca không `REGISTERED` hoặc ca đã bắt đầu trả 422 `BR-48`. W-10 khi không còn yêu cầu chờ duyệt cũng trả 422 `BR-48`.
- W-11 chỉ chấm công phân ca `REGISTERED`, `ATTENDED`, `ABSENT`, từ lúc ca bắt đầu tới P-11 ngày sau, sai thì 422 `BR-49`. Mỗi lần chấm ghi `audit_log` với `action` = `ATTENDANCE_MARKED` (NFR-03).
- W-12 chỉ gỡ được phân ca đang chiếm chỗ của ca chưa bắt đầu, sai thì 422 `BR-42`.
- Thông báo (A-8) có `type` là `SHIFT_CANCELLED` (W-6), `ASSIGNMENT_REMOVED` (W-12), `LEAVE_APPROVED`, `LEAVE_REJECTED` (W-10) và `LEAVE_EXPIRED` (job BR-48). `payload` có `message` và `shiftId`.
- Job BR-48 chạy mỗi phút: phân ca `LEAVE_REQUESTED` của ca đã bắt đầu trở về `REGISTERED` và người xin nghỉ nhận thông báo. W-10, W-11 chạy bước này trước khi kiểm, nên kết quả không phụ thuộc job đã chạy hay chưa.

### 2.7 Báo cáo

Tất cả chỉ dành cho Manager của quán. `period` nhận `day`, `week`, `month`, `year`. `date` là một ngày bất kỳ trong kỳ, mặc định hôm nay.

| # | Method | Đường dẫn | Mô tả | FR / BR | Hàm frontend |
|---|---|---|---|---|---|
| RP-1 | GET | `/reports/summary?period=&date=` | Doanh thu, số đơn, lợi nhuận gộp, giá trị đơn trung bình, và `% so với kỳ trước` (null nếu kỳ trước bằng 0) | FR-30, BR-50, BR-51, BR-53 | `analyticsService.getSummary` |
| RP-2 | GET | `/reports/revenue?period=&date=` | Chuỗi doanh thu theo mốc thời gian, so sánh hai nửa kỳ, tỷ trọng theo danh mục | FR-31, BR-50 | `analyticsService.getRevenue` |
| RP-3 | GET | `/reports/product-sales?period=&date=&categoryId=` | Bảng theo món: số lượng, doanh thu, giá vốn, lợi nhuận, biên. Món chưa có giá vốn có cờ `missingCost` | FR-32, BR-51, BR-10 | `analyticsService.getProductSales` |
| RP-4 | GET | `/reports/labor-cost?weekStart=` | Chi phí nhân công theo tuần, tách theo bộ phận | FR-33, BR-52 | `analyticsService.getLaborCost` |

**Chi tiết của nhóm RP**

- Thiếu `period` thì lấy `month`, giá trị khác bốn giá trị trên trả 400 `VALIDATION`. Kỳ là kỳ lịch chứa `date` theo giờ quán: ngày, tuần từ thứ Hai, tháng, năm. Kỳ trước là kỳ lịch liền trước (tháng trước của tháng 3 là cả tháng 2).
- Đơn được tính là đơn theo BR-50, xếp vào kỳ theo `paid_at`.
- RP-1: `orders` là số đơn, `averageOrderValue` = doanh thu / số đơn của kỳ hiện tại (0 khi không có đơn). `changePercent` làm tròn 1 chữ số, null khi kỳ trước bằng 0 (BR-53).
- RP-2: mốc của `day` là từng giờ (nhãn `HH:00`), của `week` và `month` là từng ngày (nhãn `dd/MM`), của `year` là từng tháng (nhãn `T1` … `T12`). Mốc không có đơn vẫn có mặt với giá trị 0. `currentHalf` là các mốc của kỳ hiện tại, `previousHalf` là các mốc của kỳ trước, xếp theo vị trí để vẽ chồng lên nhau, dài bằng `currentHalf`. Kỳ trước ngắn hơn (tháng 2 so với tháng 3) thì phần thiếu có nhãn rỗng và giá trị 0. `series` = mốc kỳ trước rồi mốc kỳ hiện tại. `byCategory` chỉ có danh mục có doanh thu, dòng combo gom vào `{ categoryId: null, name: "Combo" }`, sắp theo doanh thu giảm dần.
- RP-3: chỉ tính dòng món lẻ, dòng combo không chia ra món thành phần. `costPrice` và `sellingPrice` là giá vốn và giá bán trung bình một ly (gồm phần chênh của tuỳ chọn), `profitMargin` tính theo phần trăm. `missingCost` bật khi có dòng bán với `unit_cost` = 0. Sắp theo doanh thu giảm dần.
- RP-4: `weekStart` là một ngày bất kỳ, backend lùi về thứ Hai của tuần đó, thiếu thì lấy tuần hiện tại. Cộng `wage` của mọi phân ca `REGISTERED`, `LEAVE_REQUESTED`, `ATTENDED` thuộc ca `OPEN` trong tuần (BR-52). `byDepartment` liệt kê đủ bốn bộ phận, kể cả bộ phận bằng 0.

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

## 5. Trạng thái triển khai backend

Backend là một ứng dụng Spring Boot trong `backend/`, chạy ở `http://localhost:8080`. Cột **Package** là package Java chứa controller của nhóm.

| Đợt | API | Package | Trạng thái |
|---|---|---|---|
| 1 | A-1 → A-9 | `vn.drinkool.auth`, `vn.drinkool.notification` | Đã chạy, có test tích hợp |
| 1 | S-2 → S-6 | `vn.drinkool.shop`, `vn.drinkool.catalog` | Đã chạy, có test tích hợp |
| 2 | C-1 → C-19 | `vn.drinkool.catalog`, `vn.drinkool.common.audit` | Đã chạy, có test tích hợp |
| 3 | O-1 → O-9, job BR-28 | `vn.drinkool.order` | Đã chạy, có test tích hợp |
| 4 | R-1, R-2, W-1 → W-12, job BR-48 | `vn.drinkool.review`, `vn.drinkool.shift` | Đã chạy, có test tích hợp |
| 5 | RP-1 → RP-4, nối `frontend/lib/services` sang API thật | `vn.drinkool.report` | Đã chạy, có test tích hợp. Frontend không còn backend giả |

- Mọi endpoint chưa khai báo quyền ở `SecurityConfig` đều cần đăng nhập. Gọi đường dẫn không tồn tại mà không có token sẽ nhận 401, có token thì nhận 404.
- Lỗi 401 và 403 sinh ở tầng security cũng trả `application/problem+json` với `code` `UNAUTHENTICATED` hoặc `FORBIDDEN`.
- A-6, A-9 và mọi lệnh `DELETE` của nhóm C trả `204` không có body. `apiRequest` ở frontend trả `undefined` cho 204.

**Cách frontend gọi backend (từ đợt 5)**

- `next.config.ts` chuyển `/api/*` tới `API_PROXY_URL` (mặc định `http://localhost:8080`, trong image Docker là `http://backend:8080`). Rewrite được ghi cố định lúc `next build`.
- Access token gửi ở header `Authorization`. Gặp 401 ở một API cần đăng nhập, client gọi A-5 một lần rồi gửi lại. Các lệnh 401 cùng lúc dùng chung một lần A-5, vì dùng lại refresh token sẽ thu hồi mọi phiên. A-5 thất bại thì đăng xuất.
- Mọi lệnh chờ tới khi `AuthProvider` đọc xong phiên trong localStorage, để lệnh đầu tiên sau khi tải trang không đi dưới dạng khách.
- O-2 gửi `If-None-Match`; nhận 304 thì dùng lại đơn đã có.
- O-4 chỉ trả đơn của một ngày (mặc định hôm nay), khác backend giả cũ trả mọi đơn.
