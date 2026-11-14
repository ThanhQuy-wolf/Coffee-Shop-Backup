# 03 — Use case

## 1. Sơ đồ use case

Mermaid chưa có kiểu sơ đồ use case riêng. Sơ đồ dưới đây dùng `flowchart`: hình tròn là actor, hình bo tròn là use case, mũi tên nét liền là actor thực hiện use case. Quan hệ kế thừa giữa các actor không vẽ để sơ đồ đỡ rối: Customer làm được mọi việc của Guest, và Manager làm được mọi việc của Staff.

Mã UC-03 (Tìm quán) đã bỏ khi hệ thống chuyển sang phục vụ một quán. Các mã khác giữ nguyên để không phải đánh số lại tài liệu.

### 1.1 Phía khách

```mermaid
flowchart LR
    guest((Khách vãng lai))
    customer((Khách hàng))
    system((Hệ thống))

    subgraph KH[Khách]
        UC01([UC-01 Đăng ký tài khoản])
        UC02([UC-02 Đăng nhập / đăng xuất])
        UC04([UC-04 Xem menu])
        UC06([UC-06 Tìm kiếm món])
        UC05([UC-05 Quản lý giỏ hàng])
        UC07([UC-07 Đặt món và thanh toán])
        UC08([UC-08 Theo dõi đơn])
        UC09([UC-09 Xem lịch sử đơn])
        UC11([UC-11 Huỷ đơn])
        UC16([UC-16 Đánh giá đơn])
    end

    guest --> UC01
    guest --> UC02
    guest --> UC04
    guest --> UC06
    guest --> UC05
    guest --> UC07
    guest --> UC08
    guest --> UC11
    customer --> UC09
    customer --> UC16
    system --> UC11
    UC07 -. include .-> UC05
    UC04 -. extend .-> UC06
```

### 1.2 Phía quán

```mermaid
flowchart LR
    staff((Nhân viên))
    manager((Quản lý))

    subgraph DON[Đơn hàng]
        UC10([UC-10 Xử lý đơn])
        UC11b([UC-11 Huỷ đơn])
    end
    subgraph MENU[Menu và quán]
        UC12([UC-12 Quản lý danh mục])
        UC13([UC-13 Quản lý món])
        UC14([UC-14 Quản lý combo])
        UC15([UC-15 Sửa thông tin quán])
        UC17([UC-17 Xem đánh giá])
    end
    subgraph CA[Ca làm]
        UC18([UC-18 Xem lịch ca])
        UC19([UC-19 Quản lý ca])
        UC20([UC-20 Đăng ký / huỷ đăng ký ca])
        UC21([UC-21 Xin nghỉ và duyệt nghỉ])
        UC22([UC-22 Chấm công])
    end
    subgraph BC[Báo cáo]
        UC23([UC-23 Xem báo cáo doanh thu])
        UC24([UC-24 Xem chi phí nhân công])
    end

    staff --> UC10
    staff --> UC11b
    staff --> UC18
    staff --> UC20
    staff --> UC21
    manager --> UC12
    manager --> UC13
    manager --> UC14
    manager --> UC15
    manager --> UC17
    manager --> UC19
    manager --> UC21
    manager --> UC22
    manager --> UC23
    manager --> UC24
    UC20 -. include .-> UC18
```

## 2. Danh sách use case

| ID | Tên | Actor chính | FR | Màn hình frontend |
|---|---|---|---|---|
| UC-01 | Đăng ký tài khoản | Guest | FR-01 | `/register` |
| UC-02 | Đăng nhập / đăng xuất | Mọi actor | FR-02, FR-03, FR-04 | `/login`, header |
| UC-04 | Xem menu | Guest | FR-06 | `/` (trang chủ) |
| UC-05 | Quản lý giỏ hàng | Guest | FR-11 | `/`, `/checkout` |
| UC-06 | Tìm kiếm món | Guest | FR-06 | `/` |
| UC-07 | Đặt món và thanh toán | Guest | FR-12, FR-13 | `/checkout` |
| UC-08 | Theo dõi đơn | Guest | FR-14 | `/orders/[orderId]` |
| UC-09 | Xem lịch sử đơn | Customer | FR-15 | `/orders` |
| UC-10 | Xử lý đơn | Staff | FR-16, FR-17 | `/staff/orders` |
| UC-11 | Huỷ đơn | Guest, Staff, Manager, System | FR-18, FR-19 | `/orders/[orderId]`, `/staff/orders` |
| UC-12 | Quản lý danh mục | Manager | FR-07 | `/manager` (tab Danh mục) |
| UC-13 | Quản lý món | Manager | FR-08 | `/manager` (tab Thực đơn) |
| UC-14 | Quản lý combo | Manager | FR-09 | `/manager` (tab Combo) |
| UC-15 | Sửa thông tin quán | Manager | FR-10 | `/manager` (tab Thông tin quán) |
| UC-16 | Đánh giá đơn | Customer | FR-20 | `/orders/[orderId]` |
| UC-17 | Xem đánh giá | Manager | FR-21 | `/manager` (tab Đánh giá) |
| UC-18 | Xem lịch ca | Staff | FR-22 | `/staff/schedule` |
| UC-19 | Quản lý ca | Manager | FR-23, FR-24, FR-29 | `/staff/schedule` |
| UC-20 | Đăng ký / huỷ đăng ký ca | Staff | FR-25, FR-26 | `/staff/schedule` |
| UC-21 | Xin nghỉ và duyệt nghỉ | Staff, Manager | FR-27 | `/staff/schedule` |
| UC-22 | Chấm công | Manager | FR-28 | `/staff/schedule` |
| UC-23 | Xem báo cáo doanh thu | Manager | FR-30, FR-31, FR-32 | `/manager/analytics` |
| UC-24 | Xem chi phí nhân công | Manager | FR-33 | `/staff/schedule` (ô Ngân sách tuần) |

## 3. Đặc tả use case chính

### UC-07 — Đặt món và thanh toán

| Mục | Nội dung |
|---|---|
| Actor | Khách vãng lai, Khách hàng |
| Mục tiêu | Tạo đơn và trả tiền để quán pha chế |
| Tiền điều kiện | Giỏ hàng có ít nhất 1 món |
| Hậu điều kiện thành công | Có đơn `PENDING_PAYMENT` kèm thanh toán `PENDING`. Khách thấy mã đơn và (nếu chọn QR) mã QR |
| Kích hoạt | Khách bấm "Đặt món" ở trang thanh toán |

**Luồng chính**
1. Khách mở `/checkout`. Hệ thống hiển thị các dòng trong giỏ và tổng tiền.
2. Khách chọn phương thức thanh toán (Tiền mặt hoặc QR), có thể nhập số bàn và ghi chú.
3. Khách bấm "Đặt món". Frontend sinh `Idempotency-Key` cho lần đặt này và gửi `POST /api/v1/orders`.
4. Hệ thống kiểm tra: từng món đang bán (BR-21), giá khớp (BR-22), số lượng hợp lệ (BR-23).
5. Hệ thống tạo đơn, chụp tên, giá bán và giá vốn vào `order_item`, sinh mã đơn (BR-25), tạo thanh toán `PENDING`.
6. Frontend xoá giỏ và chuyển sang `/orders/{orderId}`.
7. Nếu chọn QR: hiện mã QR với số tiền và nội dung là mã đơn. Nếu chọn tiền mặt: hiện hướng dẫn "Đọc mã đơn cho nhân viên tại quầy".
8. Màn hình tự cập nhật trạng thái (UC-08) cho tới khi nhân viên xác nhận đã thu tiền.

**Luồng thay thế**
- 2a. Khách đã đăng nhập: đơn gắn với `customer_id` để hiện trong lịch sử.
- 7a. Khách đổi ý về phương thức thanh toán trước khi trả tiền: nhân viên chọn đúng phương thức khi xác nhận (UC-10), hệ thống cập nhật `payment.method`.

**Luồng ngoại lệ**
- 4a. Có món đã tắt bán: trả 422 `BR-21` kèm danh sách. Frontend đánh dấu các dòng đó, khách xoá rồi đặt lại.
- 4b. Giá đã đổi: trả 409 `BR-22` kèm giá mới. Frontend cập nhật giỏ và hiện tổng mới, khách bấm đặt lại.
- 3a. Mất mạng sau khi gửi: frontend gửi lại với **cùng** `Idempotency-Key`, nhận lại đúng đơn cũ (BR-24).
- 8a. Quá P-06 phút chưa trả tiền: hệ thống huỷ đơn (BR-28), màn hình hiện "Đơn đã hết hạn thanh toán" và nút "Đặt lại" để đưa các món về giỏ.

### UC-10 — Xử lý đơn

| Mục | Nội dung |
|---|---|
| Actor | Nhân viên, Quản lý |
| Mục tiêu | Thu tiền, pha chế và giao món đúng đơn |
| Tiền điều kiện | Đã đăng nhập với role Staff hoặc Manager |
| Hậu điều kiện thành công | Đơn `COMPLETED`, thanh toán `CONFIRMED` |

**Luồng chính**
1. Nhân viên mở `/staff/orders`. Hệ thống hiện các đơn theo cột: Chờ thanh toán, Đã thanh toán, Đang pha chế, Sẵn sàng.
2. Khách đọc mã đơn hoặc đưa màn hình chuyển khoản. Nhân viên tìm đơn theo mã, chọn phương thức và bấm "Đã thu tiền". Đơn sang `PAID`.
3. Nhân viên bấm "Bắt đầu pha chế". Đơn sang `PREPARING`.
4. Pha xong, nhân viên bấm "Xong món". Đơn sang `READY`, màn hình của khách báo "Món đã sẵn sàng".
5. Khách nhận món, nhân viên bấm "Hoàn tất". Đơn sang `COMPLETED`.

**Luồng ngoại lệ**
- 2a. Đơn đã bị huỷ hoặc đã được người khác xác nhận: trả 409 `BR-26` / `BR-27`. Màn hình tải lại đơn.
- 2b. Khách không trả tiền và bỏ đi: nhân viên bấm "Huỷ đơn" (chỉ được khi đơn còn `PENDING_PAYMENT`).
- 3a. Hết nguyên liệu sau khi đã thu tiền: nhân viên báo quản lý. Quản lý huỷ đơn có lý do và hoàn tiền (BR-29).

### UC-16 — Đánh giá đơn

| Mục | Nội dung |
|---|---|
| Actor | Khách hàng |
| Tiền điều kiện | Đơn `COMPLETED` của chính khách, chưa quá P-09 ngày, chưa có đánh giá |

**Luồng chính**
1. Ở `/orders/{orderId}` (hoặc trong lịch sử), khách bấm "Đánh giá".
2. Khách chọn 1–5 sao, nhập bình luận (tuỳ chọn) rồi gửi.
3. Hệ thống lưu đánh giá, nút "Đánh giá" đổi thành số sao đã chấm.

**Ngoại lệ:** đơn chưa hoàn tất, quá hạn hoặc đã đánh giá → 422 `BR-30` / `BR-31`.

> Ghi chú so với frontend cũ: trước đây nút "Đánh giá" nằm ở trang thanh toán, nên khách có thể đánh giá khi chưa mua gì. Đặc tả chuyển việc đánh giá sang sau khi đơn hoàn tất.

### UC-20 — Đăng ký / huỷ đăng ký ca

| Mục | Nội dung |
|---|---|
| Actor | Nhân viên (Quản lý cũng đăng ký được cho chính mình) |
| Tiền điều kiện | Ca `OPEN`, chưa bắt đầu, trong P-12 ngày tới |

**Luồng chính — đăng ký**
1. Nhân viên mở `/staff/schedule`, chọn một ca còn chỗ.
2. Hệ thống hiện chi tiết: giờ, bộ phận, lương, danh sách người đã đăng ký, số chỗ còn lại.
3. Nhân viên bấm "Đăng ký". Hệ thống khoá ca, kiểm BR-43 đến BR-46 rồi tạo phân ca `REGISTERED`.

**Luồng chính — huỷ đăng ký**
1. Nhân viên mở ca mình đã đăng ký, bấm "Huỷ đăng ký".
2. Ca còn ≥ P-10 giờ mới bắt đầu: phân ca sang `CANCELLED`, chỗ được trả lại.

**Ngoại lệ**
- 3a. Ca vừa hết chỗ: 409 `BR-43`, giao diện tải lại ca.
- 3b. Trùng giờ với ca khác: 422 `BR-45`, hiện tên ca bị trùng.
- 2a (huỷ). Còn dưới P-10 giờ: 422 `BR-47`, giao diện đưa sang form xin nghỉ (UC-21).

### UC-21 — Xin nghỉ và duyệt nghỉ

**Luồng chính**
1. Nhân viên mở ca đã đăng ký, bấm "Xin nghỉ", nhập lý do. Phân ca sang `LEAVE_REQUESTED`.
2. Quản lý thấy yêu cầu ở chi tiết ca (có nhãn "Chờ duyệt nghỉ").
3. Quản lý bấm "Duyệt": phân ca sang `LEAVE_APPROVED`, ca có thêm một chỗ trống. Hoặc bấm "Từ chối": phân ca về `REGISTERED`.

**Ngoại lệ:** ca bắt đầu mà quản lý chưa quyết định → hệ thống tự chuyển về `REGISTERED` (BR-48). Nếu nhân viên không tới, quản lý chấm `ABSENT` (UC-22).

### UC-23 — Xem báo cáo doanh thu

1. Quản lý mở `/manager/analytics`, chọn kỳ (ngày, tuần, tháng, năm).
2. Hệ thống trả số tổng quan và phần so sánh với kỳ trước (BR-50, BR-51, BR-53), chuỗi doanh thu theo thời gian, tỷ trọng theo danh mục và bảng theo món.
3. Quản lý lọc theo danh mục và sắp xếp bảng theo cột.

**Ngoại lệ:** kỳ không có đơn → các ô hiện 0 đ, phần so sánh hiện "—", biểu đồ hiện trạng thái trống.
