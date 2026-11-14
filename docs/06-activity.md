# 06 — Activity diagram

Mermaid chưa có loại sơ đồ activity riêng, nên các sơ đồ dưới đây dùng `flowchart`. Mỗi `subgraph` là một làn (swimlane) cho một actor hoặc hệ thống. Hình thoi là điểm rẽ nhánh, hình tròn là điểm bắt đầu và kết thúc.

## 1. Đặt món và thanh toán (UC-05, UC-07, UC-08)

```mermaid
flowchart TD
    subgraph KH["Khách"]
        A0(("Bắt đầu")) --> A1["Mở trang chủ /"]
        A1 --> A2["Xem menu, thêm món vào giỏ"]
        A2 --> A6["Mở /checkout"]
        A6 --> A7["Chọn Tiền mặt hoặc QR,<br/>nhập số bàn, ghi chú"]
        A7 --> A8["Bấm Đặt món"]
        A15["Sửa giỏ theo thông báo"] --> A8
    end

    subgraph HT["Hệ thống"]
        B1{"Mọi món và combo<br/>đang bán?<br/>(BR-21)"}
        B2{"Giá khớp giá hiện tại?<br/>(BR-22)"}
        B3{"Số lượng hợp lệ?<br/>(BR-23)"}
        B4["Tạo đơn PENDING_PAYMENT,<br/>chụp giá vào order_item,<br/>sinh mã đơn (BR-25),<br/>tạo payment PENDING"]
        B5{"Nhân viên xác nhận<br/>trong P-06 phút?"}
        B6["Huỷ đơn, lý do PAYMENT_TIMEOUT<br/>(BR-28), payment VOIDED"]
        B7["Đơn PAID"]
    end

    subgraph KH2["Khách (màn hình đơn)"]
        C1["Xoá giỏ, chuyển tới /orders/{id}"]
        C2{"Phương thức?"}
        C3["Hiện mã QR:<br/>số tiền + nội dung là mã đơn"]
        C4["Hiện mã đơn,<br/>đọc cho nhân viên"]
        C5["Tự cập nhật trạng thái<br/>mỗi P-07 giây"]
        C6["Báo hết hạn, nút Đặt lại"]
        C7(("Chờ pha chế"))
    end

    A8 --> B1
    B1 -- "Không" --> A15
    B1 -- "Có" --> B2
    B2 -- "Không: trả giá mới" --> A15
    B2 -- "Có" --> B3
    B3 -- "Không" --> A15
    B3 -- "Có" --> B4
    B4 --> C1 --> C2
    C2 -- "QR" --> C3 --> C5
    C2 -- "Tiền mặt" --> C4 --> C5
    C5 --> B5
    B5 -- "Có" --> B7 --> C7
    B5 -- "Không" --> B6 --> C6
```

**Điểm cần lưu ý**
- Bước "Bấm Đặt món" sinh `Idempotency-Key` một lần cho mỗi lần đặt. Nếu mất mạng thì gửi lại với cùng khoá, nên không cần vẽ nhánh "tạo trùng đơn" (BR-24).
- Khách tự huỷ được trong lúc chờ (UC-11), không vẽ ở đây để sơ đồ gọn. Xem sơ đồ 2.

## 2. Xử lý đơn tại quầy (UC-10, UC-11)

```mermaid
flowchart TD
    S0(("Đơn mới<br/>PENDING_PAYMENT")) --> S1{"Khách trả tiền?"}
    S1 -- "Trả tiền mặt<br/>hoặc chuyển khoản" --> S2["Nhân viên tìm đơn theo mã,<br/>chọn phương thức, bấm Đã thu tiền"]
    S1 -- "Bỏ đi / tự huỷ" --> X1["Huỷ đơn,<br/>payment VOIDED"]
    S1 -- "Quá P-06 phút" --> X2["Hệ thống tự huỷ<br/>PAYMENT_TIMEOUT"]
    S2 --> S3{"version khớp và<br/>đơn còn PENDING_PAYMENT?"}
    S3 -- "Không (BR-26, BR-27)" --> S4["Tải lại đơn,<br/>hiện trạng thái mới"]
    S4 --> S1
    S3 -- "Có" --> S5["PAID, payment CONFIRMED,<br/>ghi audit_log"]
    S5 --> S6["Bấm Bắt đầu pha chế → PREPARING"]
    S6 --> S7{"Pha được?"}
    S7 -- "Hết nguyên liệu" --> M1{"Quản lý duyệt huỷ<br/>có lý do? (BR-29)"}
    M1 -- "Có" --> X3["CANCELLED,<br/>payment REFUNDED,<br/>hoàn tiền ngoài hệ thống"]
    M1 -- "Không, đổi món với khách" --> S6
    S7 -- "Có" --> S8["Bấm Xong món → READY"]
    S8 --> S9["Khách nhận món,<br/>bấm Hoàn tất → COMPLETED"]
    S9 --> E1(("Kết thúc"))
    X1 --> E2(("Đơn huỷ"))
    X2 --> E2
    X3 --> E2
```

> "Đổi món với khách" không thay đổi dòng đơn trong hệ thống ở MVP. Nếu quán thường xuyên đổi món, cần thêm chức năng sửa đơn sau thanh toán (Q-06 trong [01-dac-ta.md](01-dac-ta.md#10-câu-hỏi-mở)).

## 3. Đăng ký tài khoản bằng OTP (UC-01)

```mermaid
flowchart TD
    R0(("Bắt đầu")) --> R1["Nhập số điện thoại"]
    R1 --> R2{"Đúng định dạng?<br/>(BR-01)"}
    R2 -- "Không" --> R1
    R2 -- "Có" --> R3{"Số đã có tài khoản?"}
    R3 -- "Có" --> R4["Gợi ý đăng nhập"] --> R99(("Kết thúc"))
    R3 -- "Không" --> R5{"Lần gửi trước đã<br/>quá P-01 giây?"}
    R5 -- "Chưa" --> R6["Hiện đếm ngược,<br/>chờ gửi lại"] --> R5
    R5 -- "Rồi" --> R7["Sinh OTP 6 số,<br/>lưu bản băm, gửi SMS"]
    R7 --> R8["Nhập OTP, mật khẩu, họ tên"]
    R8 --> R9{"OTP còn hạn<br/>(P-03 phút)?"}
    R9 -- "Hết hạn" --> R5
    R9 -- "Còn" --> R10{"OTP đúng?"}
    R10 -- "Sai" --> R11{"Đã sai P-02 lần?"}
    R11 -- "Chưa" --> R8
    R11 -- "Rồi" --> R12["Vô hiệu OTP,<br/>yêu cầu gửi mã mới"] --> R5
    R10 -- "Đúng" --> R13["Tạo app_user CUSTOMER,<br/>đánh dấu OTP đã dùng,<br/>cấp token"]
    R13 --> R14["Chuyển tới trang chủ / (FR-04)"] --> R99
```

## 4. Đăng ký ca và huỷ đăng ký (UC-20)

```mermaid
flowchart TD
    W0(("Bắt đầu")) --> W1["Nhân viên mở /staff/schedule,<br/>chọn một ca"]
    W1 --> W2{"Đã có phân ca<br/>hiệu lực trong ca này?"}

    W2 -- "Chưa" --> W3["Bấm Đăng ký"]
    W3 --> W4["Khoá dòng shift<br/>(SELECT … FOR UPDATE)"]
    W4 --> W5{"Ca OPEN, chưa bắt đầu,<br/>trong P-12 ngày? (BR-46)"}
    W5 -- "Không" --> WX1["Từ chối 422 BR-46"]
    W5 -- "Có" --> W6{"Đúng bộ phận hoặc<br/>được làm chéo? (BR-46)"}
    W6 -- "Không" --> WX1
    W6 -- "Có" --> W7{"Còn chỗ?<br/>(BR-43)"}
    W7 -- "Hết" --> WX2["Từ chối 409 BR-43,<br/>tải lại ca"]
    W7 -- "Còn" --> W8{"Trùng giờ với<br/>phân ca khác? (BR-45)"}
    W8 -- "Trùng" --> WX3["Từ chối 422 BR-45,<br/>hiện ca bị trùng"]
    W8 -- "Không" --> W9["Tạo phân ca REGISTERED"]
    W9 --> WE(("Kết thúc"))

    W2 -- "Đã có, REGISTERED" --> W10["Bấm Huỷ đăng ký"]
    W10 --> W11{"Còn ≥ P-10 giờ<br/>tới giờ bắt đầu? (BR-47)"}
    W11 -- "Còn" --> W12["Phân ca CANCELLED,<br/>trả lại chỗ"] --> WE
    W11 -- "Không" --> W13["Đưa sang form Xin nghỉ<br/>(sơ đồ 5)"]

    WX1 --> WE
    WX2 --> WE
    WX3 --> WE
```

## 5. Xin nghỉ và duyệt nghỉ (UC-21, UC-22)

```mermaid
flowchart TD
    subgraph NV["Nhân viên"]
        L0(("Bắt đầu")) --> L1["Mở ca đã đăng ký,<br/>bấm Xin nghỉ, nhập lý do"]
        L1 --> L2{"Phân ca REGISTERED<br/>và ca chưa bắt đầu?<br/>(BR-48)"}
        L2 -- "Không" --> L3["Từ chối 422 BR-48"]
        L2 -- "Có" --> L4["Phân ca → LEAVE_REQUESTED"]
        L9["Nhận thông báo kết quả"]
    end

    subgraph QL["Quản lý"]
        M1["Thấy nhãn Chờ duyệt nghỉ<br/>ở chi tiết ca"]
        M2{"Quyết định trước<br/>giờ bắt đầu ca?"}
        M3{"Duyệt?"}
        M4["LEAVE_APPROVED,<br/>ca có thêm một chỗ"]
        M5["Về REGISTERED"]
        M7{"Nhân viên có mặt?"}
        M8["Chấm ATTENDED"]
        M9["Chấm ABSENT"]
    end

    subgraph HT["Hệ thống (job mỗi phút)"]
        J1["Ca đã bắt đầu:<br/>chuyển LEAVE_REQUESTED<br/>về REGISTERED"]
    end

    L4 --> M1 --> M2
    M2 -- "Có" --> M3
    M3 -- "Duyệt" --> M4 --> L9
    M3 -- "Từ chối" --> M5 --> L9
    M2 -- "Không" --> J1 --> L9
    M5 --> M7
    J1 --> M7
    M7 -- "Có" --> M8
    M7 -- "Không" --> M9
    M8 --> E1(("Kết thúc"))
    M9 --> E1
    M4 --> E1
    L3 --> E1
```

**Điểm cần lưu ý:** nhân viên bị từ chối nghỉ nhưng vẫn không tới thì bị chấm `ABSENT` và không được tính lương (BR-52). Quy định này cần được thông báo rõ cho nhân viên.

## 6. Tự huỷ đơn quá hạn thanh toán (BR-28)

```mermaid
flowchart TD
    T0(("Mỗi phút")) --> T1["Đọc payment_timeout_minutes<br/>từ shop_info"]
    T1 --> T2["UPDATE customer_order<br/>SET status = CANCELLED,<br/>cancel_reason = PAYMENT_TIMEOUT,<br/>version = version + 1<br/>WHERE status = PENDING_PAYMENT<br/>AND created_at < now() - timeout<br/>RETURNING id"]
    T2 --> T3{"Có đơn bị huỷ?"}
    T3 -- "Không" --> T9(("Kết thúc"))
    T3 -- "Có" --> T4["Cập nhật payment → VOIDED<br/>cho các đơn đó"]
    T4 --> T5["Ghi log số đơn đã huỷ"]
    T5 --> T9
```

Câu lệnh `UPDATE` có điều kiện trạng thái nên chạy lại hai lần vẫn cho đúng kết quả. Nếu nhân viên xác nhận thanh toán đúng lúc job chạy, chỉ một trong hai `UPDATE` thành công. Bên thua nhận 409 và tải lại đơn.

## 7. Xem báo cáo doanh thu (UC-23)

```mermaid
flowchart TD
    P0(("Bắt đầu")) --> P1["Quản lý mở /manager/analytics"]
    P1 --> P2["Chọn kỳ: ngày, tuần, tháng, năm"]
    P2 --> P3["Gọi song song RP-1, RP-2, RP-3"]
    P3 --> P4{"Kỳ có đơn được tính<br/>doanh thu? (BR-50)"}
    P4 -- "Không" --> P5["Ô số liệu 0 đ,<br/>biểu đồ trạng thái trống"]
    P4 -- "Có" --> P6["Hiện tổng quan,<br/>biểu đồ, bảng theo món"]
    P6 --> P7{"Kỳ trước bằng 0?<br/>(BR-53)"}
    P7 -- "Có" --> P8["Phần so sánh hiện —"]
    P7 -- "Không" --> P9["Hiện % tăng / giảm"]
    P8 --> P10["Lọc danh mục, sắp xếp bảng"]
    P9 --> P10
    P5 --> P10
    P10 --> P11{"Có món chưa khai báo giá vốn?"}
    P11 -- "Có" --> P12["Đánh dấu Chưa có giá vốn,<br/>lợi nhuận của món đó không đáng tin"]
    P11 -- "Không" --> P13(("Kết thúc"))
    P12 --> P13
```
