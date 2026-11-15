# 02 — Business rules

Khi backend từ chối một request vì vi phạm rule, nó trả `application/problem+json` có trường `rule` mang mã BR tương ứng (xem [05-api.md](05-api.md#3-lỗi)). Frontend dựa vào mã này để hiện thông báo phù hợp, không dựa vào câu chữ.

Cột **Cấu hình** cho biết rule có tham số chủ quán đổi được hay không. Mọi con số trong mục 2 chỉ là **gợi ý**, cần business chốt trước khi go-live.

## 1. Danh sách rule

### 1.1 Tài khoản và phân quyền

| ID | Rule | Cấu hình | Ghi chú |
|---|---|---|---|
| BR-01 | Số điện thoại khách là số di động Việt Nam 10 số, đầu `03`, `05`, `07`, `08`, `09`. Mỗi số chỉ gắn với một tài khoản | Không | Regex hiện có ở frontend: `^0[35789][0-9]{8}$` |
| BR-02 | OTP gồm 6 chữ số, hết hạn sau P-03 phút, nhập sai tối đa P-02 lần. Mỗi số điện thoại chỉ được yêu cầu OTP mới sau P-01 giây | Có | Chỉ lưu bản băm của OTP |
| BR-04 | Đăng nhập sai P-04 lần liên tiếp thì khoá đăng nhập P-05 phút | Có | Đếm theo tài khoản, không theo IP |

### 1.2 Menu

| ID | Rule | Cấu hình | Ghi chú |
|---|---|---|---|
| BR-10 | Giá bán và giá vốn là số nguyên ≥ 0 (đồng). Giá bán > 0 | Không | Giá vốn = 0 nghĩa là chưa khai báo; báo cáo đánh dấu "chưa có giá vốn" |
| BR-11 | Không xoá được danh mục còn món (kể cả món đang tắt bán). Phải chuyển món sang danh mục khác trước | Không | Món đã xoá mềm thì không tính. Bản thân danh mục cũng chỉ xoá mềm |
| BR-12 | Tên món là duy nhất, không phân biệt hoa thường, không tính món đã xoá | Không | |
| BR-13 | Combo phải có ít nhất 2 món, hoặc 1 món với số lượng ≥ 2. Combo chỉ bán được khi mọi món thành phần đang bán; tắt một món thì các combo chứa món đó tự ẩn khỏi menu | Không | Khi tính tình trạng bán, combo đọc trạng thái của món thành phần |
| BR-14 | Món và combo đã xuất hiện trong ít nhất một đơn thì chỉ được xoá mềm (`deleted_at`). Món chưa từng bán thì xoá cứng được. Món đang nằm trong combo thì phải gỡ khỏi combo trước | Không | Giữ toàn vẹn lịch sử đơn |
| BR-15 | Mọi thay đổi giá bán hoặc giá vốn đều ghi `audit_log` (giá cũ, giá mới, người sửa) | Không | |
| BR-16 | Nhóm tuỳ chọn có kiểu `SINGLE` (chọn một) hoặc `MULTIPLE` (chọn nhiều) và khoảng `[min_select, max_select]` với 0 ≤ `min_select` ≤ `max_select`. Kiểu `SINGLE` luôn có `max_select` = 1. `min_select` ≥ 1 nghĩa là nhóm bắt buộc. Nhóm có ít nhất 1 giá trị. Nhóm `SINGLE` có tối đa 1 giá trị mặc định, và nhóm `SINGLE` bắt buộc phải có đúng 1 giá trị mặc định. Nhóm `MULTIPLE` không có giá trị mặc định. Tên nhóm duy nhất, tên giá trị duy nhất trong nhóm, không phân biệt hoa thường | Không | Ví dụ: Size (`SINGLE`, bắt buộc, mặc định M), Topping (`MULTIPLE`, 0 → 3) |
| BR-17 | Giá chênh (`price_delta`) và giá vốn chênh (`cost_delta`) của mỗi giá trị là số nguyên ≥ 0 (đồng). Đơn giá một dòng món = giá bán của món + Σ `price_delta` của các giá trị đã chọn. Giá vốn của dòng = `cost_price` + Σ `cost_delta`. Với dòng combo: đơn giá = giá combo + Σ `price_delta` của lựa chọn ở mọi ly trong combo, giá vốn = Σ (`cost_price` × số lượng) của món thành phần + Σ `cost_delta`. Cả hai được chụp vào đơn lúc đặt. Đổi `price_delta` hoặc `cost_delta` cũng ghi `audit_log` như BR-15 | Không | Không cho giá chênh âm để tránh dòng đơn có giá ≤ 0. Báo cáo lợi nhuận tự tính đúng vì `unit_cost` đã gồm phần chênh (BR-51) |
| BR-18 | Lựa chọn của mỗi dòng món khi đặt phải hợp lệ: mỗi giá trị thuộc một nhóm đang gắn với món, không chọn trùng, và số giá trị chọn trong mỗi nhóm nằm trong `[min_select, max_select]`. Dòng combo gửi lựa chọn theo từng ly (`components`, đánh số `no` từ 1 theo thứ tự món và số lượng trong combo). Mỗi ly được kiểm như một dòng món với nhóm của món đó. Ly không gửi lựa chọn coi như chọn rỗng, nên ly có nhóm bắt buộc phải được gửi. `no` ngoài khoảng hoặc trùng là sai. Dòng combo không dùng `optionValueIds` | Không | Sai thì trả 422 `BR-18`, `errors[]` chỉ ra dòng và nhóm. Giá trị đã tắt hoặc đã xoá thì trả `BR-21` |
| BR-19 | Tắt bán hoặc xoá một giá trị chỉ ẩn giá trị đó, không ẩn món. Nếu một nhóm bắt buộc của món không còn đủ `min_select` giá trị đang bán thì món coi như tạm hết, kéo theo các combo chứa món đó (BR-13). Giá trị hoặc nhóm đã xuất hiện trong ít nhất một đơn thì chỉ xoá mềm. Gỡ nhóm khỏi món không làm đổi đơn cũ | Không | Đơn cũ đọc tên và giá chênh đã chụp, không đọc nhóm hiện tại |

### 1.3 Đặt món và thanh toán

| ID | Rule | Cấu hình | Ghi chú |
|---|---|---|---|
| BR-21 | Chỉ đặt được món, combo và giá trị tuỳ chọn đang bán, chưa bị xoá | Không | Lỗi trả danh sách mục không hợp lệ. Tuỳ chọn hỏng có `reason` = `OPTION_UNAVAILABLE` |
| BR-22 | Đơn bị từ chối nếu giá trong giỏ khác giá hiện tại. Với món và combo có tuỳ chọn, giá so sánh là đơn giá đã cộng giá chênh (BR-17). Backend trả giá mới để khách xác nhận lại | Không | Không tự sửa giá thầm lặng |
| BR-23 | Mỗi dòng có số lượng từ 1 đến P-08. Đơn có ít nhất 1 dòng, tổng tiền > 0. Hai dòng cùng món (hoặc cùng combo) nhưng khác lựa chọn là hai dòng riêng, mỗi dòng tự tính giới hạn P-08 | Có (P-08) | Chặn đơn nhầm kiểu "999 ly" |
| BR-24 | Tạo đơn là thao tác idempotent theo header `Idempotency-Key`: gửi lại cùng khoá thì trả về đúng đơn đã tạo. Cùng khoá mà nội dung giỏ khác (kể cả khác lựa chọn) thì bị từ chối | Không | Chống bấm hai lần hoặc gửi lại khi mạng lỗi. Khoá lưu cùng đơn, duy nhất toàn hệ thống |
| BR-25 | Mã đơn có dạng `DH-<YYMMDD>-<số thứ tự trong ngày, 4 chữ số>`, ví dụ `DH-260410-0042`. Nội dung chuyển khoản QR là mã đơn | Không | Số thứ tự trong ngày giúp nhân viên gọi khách |
| BR-26 | Chỉ xác nhận thanh toán được cho đơn `PENDING_PAYMENT`. Số tiền xác nhận phải bằng `total` của đơn | Không | Không hỗ trợ trả thiếu hoặc trả nhiều lần |
| BR-27 | Mọi lệnh chuyển trạng thái đơn đều gửi kèm `version` hiện tại (optimistic locking). Lệch version thì trả 409 | Không | Hai nhân viên cùng thao tác một đơn |
| BR-28 | Đơn `PENDING_PAYMENT` quá P-06 phút thì hệ thống tự huỷ, ghi lý do `PAYMENT_TIMEOUT` | Có | Job chạy mỗi phút, phải idempotent |
| BR-29 | Chỉ Manager huỷ được đơn đã `PAID` hoặc `PREPARING`, bắt buộc nhập lý do. Thanh toán chuyển sang `REFUNDED` và hoàn tiền ngoài hệ thống | Không | Ghi `audit_log` |

### 1.4 Đánh giá

| ID | Rule | Cấu hình | Ghi chú |
|---|---|---|---|
| BR-30 | Chỉ đánh giá được đơn `COMPLETED` của chính mình, trong vòng P-09 ngày kể từ khi hoàn tất | Có | |
| BR-31 | Mỗi đơn chỉ có một đánh giá. Số sao là số nguyên 1–5, bình luận tối đa 500 ký tự. Không sửa được sau khi gửi | Không | |

### 1.5 Ca làm

| ID | Rule | Cấu hình | Ghi chú |
|---|---|---|---|
| BR-40 | Giờ kết thúc ca phải sau giờ bắt đầu, trong cùng một ngày. Không hỗ trợ ca qua đêm | Không | Quán đóng cửa trước nửa đêm (07:00–22:00) |
| BR-41 | `max_staff` từ 1 đến 20, lương mỗi ca > 0. Không giảm được `max_staff` xuống dưới số người đang chiếm chỗ | Không | |
| BR-42 | Đổi ngày hoặc giờ của ca đã có người đăng ký thì bị chặn nếu làm ai đó bị trùng lịch. Huỷ ca hoặc gỡ người khỏi ca thì phải gửi thông báo cho người bị ảnh hưởng | Không | Thông báo hiện trong ứng dụng ở lần đăng nhập tới |
| BR-43 | Số phân ca đang chiếm chỗ (`REGISTERED`, `LEAVE_REQUESTED`, `ATTENDED`, `ABSENT`) không vượt `max_staff` | Không | `LEAVE_APPROVED` và `CANCELLED` trả lại chỗ |
| BR-44 | Một nhân viên chỉ có tối đa một phân ca đang hiệu lực trong mỗi ca | Không | Unique index một phần |
| BR-45 | Nhân viên không được có hai phân ca chiếm chỗ mà giờ chồng nhau trong cùng ngày. Hai ca nối tiếp nhau (11:00 kết thúc, 11:00 bắt đầu) không tính là trùng | Không | Khoảng thời gian nửa mở `[start, end)` |
| BR-46 | Chỉ đăng ký được ca `OPEN` chưa bắt đầu và nằm trong P-12 ngày tới. Nhân viên chỉ đăng ký được ca thuộc bộ phận của mình, trừ khi ca được quản lý bật cho phép làm chéo | Có (P-12) | Bộ phận của nhân viên: `app_user.department_id`. Cờ làm chéo: `shift.allow_cross_department` |
| BR-47 | Nhân viên tự huỷ đăng ký được nếu ca còn ít nhất P-10 giờ nữa mới bắt đầu. Sát giờ hơn thì phải gửi yêu cầu xin nghỉ | Có | |
| BR-48 | Chỉ xin nghỉ được cho phân ca `REGISTERED` của ca chưa bắt đầu, bắt buộc có lý do. Quản lý quyết định trước giờ bắt đầu ca; quá giờ mà chưa duyệt thì phân ca trở về `REGISTERED` | Không | |
| BR-49 | Chấm công chỉ làm được sau khi ca bắt đầu. Sửa chấm công được trong P-11 ngày | Có | Ghi `audit_log` |

### 1.6 Báo cáo

| ID | Rule | Cấu hình | Ghi chú |
|---|---|---|---|
| BR-50 | Doanh thu = tổng `total` của đơn ở trạng thái `PAID`, `PREPARING`, `READY`, `COMPLETED`, tính theo `paid_at`. Đơn bị huỷ sau khi đã thanh toán **không** tính | Không | Mốc thời gian là lúc thu tiền, không phải lúc đặt |
| BR-51 | Lợi nhuận gộp = Σ (`unit_price` − `unit_cost`) × `quantity` trên các dòng của đơn được tính doanh thu. Dùng giá vốn đã chụp lúc bán, không tính lại theo giá vốn hiện tại | Không | Biên lợi nhuận = lợi nhuận / doanh thu. Với dòng combo, `unit_cost` = Σ `cost_price` × `quantity` của món thành phần tại lúc bán, và dòng này được xếp vào nhóm "Combo" khi tính tỷ trọng theo danh mục |
| BR-52 | Chi phí nhân công trong một khoảng thời gian = Σ `shift.wage` × số phân ca `REGISTERED`, `LEAVE_REQUESTED` hoặc `ATTENDED`. Không tính `ABSENT`, `LEAVE_APPROVED`, `CANCELLED` | Không | Trước khi chấm công, con số này là chi phí dự kiến |
| BR-53 | "So với kỳ trước" là so với kỳ liền trước có cùng độ dài (tháng này so với tháng trước) | Không | Kỳ trước bằng 0 thì hiện "—", không chia cho 0 |

## 2. Tham số nghiệp vụ

| ID | Tham số | Gợi ý | Ai chốt |
|---|---|---|---|
| P-01 | Khoảng cách tối thiểu giữa hai lần gửi OTP | 60 giây | Vận hành |
| P-02 | Số lần nhập sai OTP tối đa | 5 | Vận hành |
| P-03 | Thời hạn OTP | 5 phút | Vận hành |
| P-04 | Số lần đăng nhập sai trước khi khoá | 5 | Vận hành |
| P-05 | Thời gian khoá đăng nhập | 15 phút | Vận hành |
| P-06 | Thời hạn thanh toán của đơn | 15 phút | Chủ quán |
| P-07 | Chu kỳ cập nhật trạng thái đơn trên màn hình khách | 5 giây | Kỹ thuật |
| P-08 | Số lượng tối đa mỗi dòng đơn | 20 | Chủ quán |
| P-09 | Thời hạn được đánh giá sau khi hoàn tất | 7 ngày | Chủ quán |
| P-10 | Hạn tự huỷ đăng ký ca trước giờ bắt đầu | 12 giờ | Chủ quán |
| P-11 | Thời hạn được sửa chấm công | 3 ngày | Chủ quán |
| P-12 | Số ngày tối đa được đăng ký ca trước | 14 ngày | Chủ quán |

Tham số do chủ quán chốt được lưu trong bản ghi cấu hình duy nhất `shop_info` (xem [04-erd.md](04-erd.md)). Tham số vận hành P-01 → P-05 lưu trong cấu hình backend, khoá `drinkool.auth.*` của `backend/src/main/resources/application.yml`.

Các mã BR-03, BR-05, BR-20 đã bỏ khi hệ thống chuyển sang phục vụ một quán. Mã đã bỏ không dùng lại cho rule khác.
