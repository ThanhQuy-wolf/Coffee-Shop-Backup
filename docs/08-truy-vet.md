# 08 — Ma trận truy vết

Bảng này nối từng use case tới yêu cầu, rule, API, màn hình và hàm service ở frontend. Dùng nó để kiểm tra độ phủ: một FR không có API, hoặc một API không có màn hình gọi tới, đều là dấu hiệu thiếu sót.

Mã API lấy từ [05-api.md](05-api.md#2-bảng-endpoint). Hàm service nằm trong `frontend/lib/services/`.

## 1. UC → FR → BR → API → màn hình

| UC | FR | BR | API | Màn hình | Service |
|---|---|---|---|---|---|
| UC-01 Đăng ký | FR-01 | BR-01, BR-02 | A-3, A-4 | `/register` | `authService.requestOtp`, `authService.register` |
| UC-02 Đăng nhập / đăng xuất | FR-02, FR-03, FR-04 | BR-04 | A-1, A-2, A-5, A-6, A-7 | `/login`, header | `authService.loginCustomer`, `loginStaff`, `refresh`, `logout`, `getMe` |
| UC-03 Tìm quán | FR-05 | BR-05 | S-1 | `/feed` | `shopService.list` |
| UC-04 Xem menu | FR-06 | BR-05, BR-10, BR-13 | S-2, S-6 | `/shops/[shopId]` | `shopService.get`, `catalogService.getMenu` |
| UC-05 Giỏ hàng | FR-11 | BR-20 | — (lưu trên thiết bị) | `/shops/[shopId]`, `/checkout` | `CartContext` |
| UC-06 Tìm món | FR-06 | — | S-6 (`?q=`) | `/shops/[shopId]` | `catalogService.getMenu` |
| UC-07 Đặt món | FR-12, FR-13 | BR-20 → BR-25 | O-1 | `/checkout` | `orderService.create` |
| UC-08 Theo dõi đơn | FR-14 | — | O-2 | `/orders/[orderId]` | `orderService.get` |
| UC-09 Lịch sử đơn | FR-15 | — | O-3 | `/orders` | `orderService.listMine` |
| UC-10 Xử lý đơn | FR-16, FR-17 | BR-03, BR-26, BR-27 | O-4 → O-8 | `/staff/orders` | `orderService.listByShop`, `confirmPayment`, `start`, `markReady`, `complete` |
| UC-11 Huỷ đơn | FR-18, FR-19 | BR-27, BR-28, BR-29 | O-9, job | `/orders/[orderId]`, `/staff/orders` | `orderService.cancel` |
| UC-12 Danh mục | FR-07 | BR-11 | C-1 → C-4 | `/manager` tab Danh mục | `catalogService.*Category` |
| UC-13 Món | FR-08 | BR-10, BR-12, BR-14, BR-15 | C-5 → C-9 | `/manager` tab Thực đơn | `catalogService.*Product`, `setProductAvailability` |
| UC-14 Combo | FR-09 | BR-13, BR-14, BR-15 | C-10 → C-14 | `/manager` tab Combo | `catalogService.*Combo`, `setComboAvailability` |
| UC-15 Thông tin quán | FR-10 | — | S-3, S-4, S-5 | `/manager` tab Thông tin quán | `shopService.update`, `getSettings`, `updateSettings` |
| UC-16 Đánh giá | FR-20 | BR-30, BR-31 | R-1 | `/orders/[orderId]` | `reviewService.create` |
| UC-17 Xem đánh giá | FR-21 | — | R-2 | `/manager` tab Đánh giá | `reviewService.listByShop` |
| UC-18 Xem lịch ca | FR-22 | — | W-1, W-3 | `/staff/schedule` | `shiftService.listDepartments`, `listShifts` |
| UC-19 Quản lý ca | FR-23, FR-24, FR-29 | BR-40, BR-41, BR-42 | W-2, W-4, W-5, W-6, W-12 | `/staff/schedule` | `shiftService.listStaff`, `createShift`, `updateShift`, `cancelShift`, `removeAssignment` |
| UC-20 Đăng ký ca | FR-25, FR-26 | BR-43 → BR-47 | W-7, W-8 | `/staff/schedule` | `shiftService.register`, `unregister` |
| UC-21 Xin nghỉ | FR-27 | BR-48 | W-9, W-10, A-8, A-9 | `/staff/schedule` | `shiftService.requestLeave`, `decideLeave`, `notificationService.*` |
| UC-22 Chấm công | FR-28 | BR-49 | W-11 | `/staff/schedule` | `shiftService.markAttendance` |
| UC-23 Báo cáo doanh thu | FR-30, FR-31, FR-32 | BR-50, BR-51, BR-53 | RP-1, RP-2, RP-3 | `/manager/analytics` | `analyticsService.getSummary`, `getRevenue`, `getProductSales` |
| UC-24 Chi phí nhân công | FR-33 | BR-52 | RP-4 | `/staff/schedule` (ô Ngân sách tuần) | `analyticsService.getLaborCost` |

## 2. Kiểm tra độ phủ

| Kiểm tra | Kết quả |
|---|---|
| Mỗi FR thuộc ít nhất một UC | Đạt: FR-01 → FR-33 đều có |
| Mỗi FR có API (trừ FR chỉ ở frontend) | Đạt. FR-11 (giỏ hàng) chỉ ở frontend, FR-19 chạy bằng job |
| Mỗi API có màn hình gọi tới | Đạt, sau khi thêm A-8/A-9 vào header (chuông thông báo) và S-4/S-5 vào tab Thông tin quán |
| Mỗi BR được ít nhất một FR hoặc API tham chiếu | Đạt. BR-03 áp cho mọi API có phạm vi quán |
| Mỗi trạng thái trong vòng đời có lệnh chuyển tương ứng | Đạt. Đơn: O-5 → O-9 và job. Phân ca: W-7 → W-12 và job BR-48. Ca: W-6 |

## 3. Bảng ánh xạ màn hình hiện có → màn hình theo đặc tả

| Màn hình cũ | Theo đặc tả | Thay đổi |
|---|---|---|
| `/` (menu một quán) | `/shops/[shopId]` | Menu chuyển sang đường dẫn có `shopId`. `/` chuyển hướng sang `/feed` |
| `/feed` | `/feed` | Bấm vào quán thì mở `/shops/[shopId]` |
| `/payment` | `/checkout` → `/orders/[orderId]` | Tách thành bước đặt món và bước theo dõi đơn. Bỏ nút đánh giá ở bước thanh toán |
| — | `/orders`, `/orders/[orderId]` | Mới: lịch sử và chi tiết đơn, có đánh giá |
| — | `/staff/orders` | Mới: hàng đợi đơn của quán |
| `/login`, `/register` | `/login`, `/register` | Đăng ký thêm bước OTP. Đăng nhập có lựa chọn Khách / Nhân viên, chuyển hướng theo role |
| `/manager` | `/manager` | Thêm tab Thông tin quán và Đánh giá |
| `/manager/analytics` | `/manager/analytics` | Số liệu tính theo BR-50 → BR-53 |
| `/staff/schedule` | `/staff/schedule` | Trạng thái nghỉ, vắng nằm ở từng phân ca. Thêm duyệt nghỉ, chấm công, gỡ người |
