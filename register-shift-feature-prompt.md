# Feature Prompt: Register Shift (Đăng Ký Ca Làm)

## Tổng Quan

Xây dựng tính năng **Register Shift** cho phép nhân viên xem và đăng ký ca làm việc theo khung thời gian do quản lý tạo ra. Tính năng hỗ trợ cả hai vai trò: **Manager** và **Staff**, với giao diện responsive thích ứng theo kích thước màn hình.

---

## Mục Đích

- Cho phép nhân viên xem danh sách các khung thời gian ca làm khả dụng và đăng ký vào ca mà họ muốn làm.
- Quản lý (Manager) có toàn quyền tạo, chỉnh sửa và xóa các khung thời gian ca làm.
- Nhân viên có thể thấy ca làm của đồng nghiệp để tránh xung đột hoặc điều chỉnh lịch phù hợp.
- Cả Manager và Staff đều có thể chỉnh sửa hoặc hủy ca đã đăng ký của nhân viên.

---

## Vai Trò & Phân Quyền

### Manager
- Tạo, chỉnh sửa, xóa khung thời gian ca làm (shift slots).
- Xem lịch làm việc của toàn bộ nhân viên theo tuần hoặc tháng.
- Phê duyệt hoặc từ chối yêu cầu đăng ký ca.
- Xóa hoặc thay đổi ca làm của bất kỳ nhân viên nào.
- Gán ca làm cho nhân viên cụ thể nếu cần.

### Staff (Nhân Viên)
- Xem danh sách ca làm khả dụng trong tuần hoặc tháng.
- Đăng ký vào ca mà mình muốn làm.
- Xem ca đã được đăng ký bởi các nhân viên khác.
- Hủy hoặc chỉnh sửa ca đã đăng ký của bản thân (trong giới hạn thời gian cho phép).

---

## Yêu Cầu Giao Diện

### Desktop (≥ 1024px) — Dạng Bảng Lịch Tuần/Tháng

- Hiển thị lịch làm việc dạng **table theo tuần** (mặc định), với khả năng chuyển sang **xem theo tháng**.
- Mỗi cột đại diện cho một ngày trong tuần (Mon–Sun).
- Mỗi hàng đại diện cho một nhân viên hoặc một khung giờ.
- Các ca làm được hiển thị dưới dạng **card màu** trong ô tương ứng, gồm:
  - Tên ca / Khung giờ (ví dụ: `08:00 – 12:00`)
  - Số giờ làm & mức lương dự kiến (ví dụ: `4h · 120k`)
  - Trạng thái: `Available`, `Registered`, `Approved Leave`, `Absent`
- **Bộ lọc tuần/tháng** ở góc trên, cho phép điều hướng qua lại giữa các tuần/tháng.
- Hiển thị **tổng ngân sách tuần** (Weekly Budget) ở đầu bảng.
- Nhóm nhân viên theo **department/role** (ví dụ: Bar Staff, Janitors,...).
- Mỗi ca làm có thể click để xem chi tiết, chỉnh sửa hoặc xóa.

#### Chế Độ Xem Theo Tháng (Month View)
- Hiển thị dạng **calendar grid** (lưới 7 cột × ~5 hàng).
- Mỗi ô ngày hiển thị số ca đã đăng ký hoặc dấu chấm màu trạng thái (tương tự ảnh tham khảo).
- Cho phép nhân viên và manager tính toán ngày có thể nghỉ hoặc đăng ký ca xa hơn trong tháng.

---

### Mobile (< 768px) — Dạng Lịch Dọc + Dot Indicator

- Hiển thị **calendar theo tháng dạng nhỏ gọn** (compact calendar) ở đầu màn hình.
  - Các ngày có ca làm được đánh dấu bằng **dot màu** phía dưới số ngày:
    - 🟡 Vàng: Ca đang mở / khả dụng
    - 🟢 Xanh lá: Ca đã được đăng ký
    - ⚫ Xám: Không có ca
  - Ngày hiện tại được highlight bằng vòng tròn (dark circle).
- Khi chọn một ngày, hiển thị danh sách ca làm của ngày đó bên dưới.
- Mỗi ca làm hiển thị dưới dạng **card dọc**:
  - Khung giờ, số giờ, mức lương
  - Tên nhân viên đã đăng ký (nếu có)
  - Nút **Đăng ký** hoặc **Hủy đăng ký**
- Điều hướng tháng bằng nút `<` và `>` ở hai bên tiêu đề tháng.

---

## Trạng Thái Ca Làm (Shift Status)

| Trạng Thái     | Màu             | Mô Tả                             |
|----------------|-----------------|-----------------------------------|
| Available      | Xanh dương nhạt | Ca đang mở, chưa có ai đăng ký    |
| Registered     | Xanh dương đậm  | Nhân viên đã đăng ký ca này       |
| Approved Leave | Tím/Lavender    | Nhân viên đã được duyệt nghỉ phép |
| Absent         | Đỏ/Hồng         | Nhân viên vắng mặt không có lý do |

---

## Luồng Chức Năng Chính

### Staff — Đăng Ký Ca
1. Truy cập màn hình Register Shift.
2. Chọn tuần hoặc tháng muốn xem.
3. Xem các ca làm khả dụng (Available).
4. Click vào ca → Xem thông tin chi tiết (giờ, lương, số người đã đăng ký).
5. Nhấn **Register** để đăng ký ca.
6. Ca chuyển sang trạng thái **Registered**.

### Manager — Tạo Ca Làm Mới
1. Vào giao diện dashboard của manager.
2. Vào giao diện lịch của nhóm/department.
3. Click vào ô ngày muốn tạo ca.
4. Nhập thông tin: Khung giờ bắt đầu – kết thúc, số lượng nhân viên cần, mức lương.
5. Lưu → Ca hiển thị trên lịch với trạng thái **Available**.

### Xóa / Chỉnh Sửa Ca
- **Manager**: Có thể chỉnh sửa hoặc xóa bất kỳ ca nào của bất kỳ nhân viên nào.
- **Staff**: Chỉ có thể hủy ca của bản thân, trong phạm vi thời gian cho phép (ví dụ: trước 24h so với giờ bắt đầu ca).

---

## Dữ Liệu & Logic

### Shift Slot Object
```json
{
  "id": "shift_001",
  "date": "2025-04-22",
  "startTime": "08:00",
  "endTime": "12:00",
  "durationHours": 3.5,
  "wage": 80,
  "department": "Bar Staff",
  "maxStaff": 2,
  "registeredStaff": [
    { "id": "staff_01", "name": "Carol Saragosa" }
  ],
  "status": "registered"
}
```

---

## Ghi Chú Bổ Sung

- Nhân viên **không được đăng ký 2 ca trùng giờ** trong cùng một ngày.
- Hệ thống cần hiển thị **cảnh báo xung đột** khi nhân viên cố đăng ký ca bị trùng lịch.
- Cần hỗ trợ **thông báo (notification)** khi ca làm bị thay đổi hoặc bị hủy bởi manager.
