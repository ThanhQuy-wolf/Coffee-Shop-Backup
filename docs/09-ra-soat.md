# 09 — Biên bản rà soát đặc tả

Rà soát toàn bộ tài liệu 01 → 08 sau khi viết xong, trước khi sửa frontend. Lần 2 (mục 3) rà soát sau khi chuyển sang một quán. Mục tiêu: các mã tham chiếu khớp nhau, dữ liệu đủ để thực thi từng rule, có đủ luồng ngoại lệ, và mọi sơ đồ Mermaid hiển thị được.

## 1. Cách rà soát

| Hạng mục | Cách làm | Kết quả |
|---|---|---|
| Mã tham chiếu | Script quét mọi `FR-`, `NFR-`, `BR-`, `P-`, `UC-`, `Q-` trong 01 → 08, so với nơi định nghĩa | 0 mã bị trỏ tới mà chưa định nghĩa. 33 FR, 7 NFR, 37 BR, 12 P, 24 UC, 6 Q |
| Liên kết giữa tài liệu | Kiểm mọi đường dẫn `*.md` | Đạt |
| Cú pháp Mermaid | Render từng khối bằng `@mermaid-js/mermaid-cli` 11.4 | 20/20 khối render được, sau khi sửa lỗi R-01 |
| Độ phủ UC → FR → BR → API → màn hình | Bảng ở [08-truy-vet.md](08-truy-vet.md) | Đạt |
| Đối chiếu rule với dữ liệu | Với mỗi BR, tìm cột hoặc ràng buộc trong ERD để thực thi | Phát hiện R-02, R-03, R-07, R-08 |
| Đối chiếu mã lỗi | So mã HTTP trong use case với bảng lỗi của API | Phát hiện R-04 |

## 2. Lỗi đã phát hiện và đã sửa

| # | Tài liệu | Vấn đề | Đã sửa |
|---|---|---|---|
| R-01 | 07 | Sơ đồ 5 dùng dấu `;` trong nội dung message. Mermaid hiểu `;` là kết thúc câu lệnh nên không render được | Thay bằng dấu phẩy |
| R-02 | 02, 04, 05 | BR-46 cho phép "quản lý cho phép làm chéo bộ phận" nhưng ERD không có chỗ lưu quyết định đó | Thêm `shift.allow_cross_department` (mặc định `false`), thêm vào body W-4 và response W-3 |
| R-03 | 02, 04 | BR-51 tính lợi nhuận theo `unit_cost`, nhưng không nói giá vốn của **dòng combo** lấy từ đâu, và combo không có danh mục để tính tỷ trọng | Quy định `unit_cost` của combo = Σ giá vốn món thành phần × số lượng lúc bán. Dòng combo xếp vào nhóm "Combo" |
| R-04 | 03, 05 | UC-10 trả 409 cho BR-26 (đơn đã được người khác xác nhận), nhưng bảng lỗi API xếp BR-26 vào nhóm 422 | Tách: 409 `BR-26` khi đơn không còn `PENDING_PAYMENT`, 422 `BR-26` khi số tiền lệch |
| R-05 | 02, 04, 05 | BR-24 nói khoá idempotency có hiệu lực 24 giờ, nhưng DDL đặt `UNIQUE (shop_id, idempotency_key)` vĩnh viễn. Hai chỗ mâu thuẫn | Bỏ mốc 24 giờ. Khoá lưu cùng đơn, duy nhất trong quán. Cùng khoá khác nội dung giỏ thì trả 422 `BR-24` |
| R-06 | 04, 05, 07 | `version` mặc định là 0 trong DDL, còn ví dụ API và sequence bắt đầu từ 1 | Đổi mặc định thành 1 |
| R-07 | 02, 04, 05 | BR-11 bỏ qua món đã xoá mềm khi xoá danh mục, nhưng `product.category_id` có khoá ngoại tới `category`. Xoá cứng danh mục sẽ lỗi khoá ngoại | Danh mục cũng xoá mềm (`category.deleted_at`). Đổi `UNIQUE (shop_id, name)` thành unique index một phần, không phân biệt hoa thường |
| R-08 | 02, 04 | BR-14 cho xoá cứng món chưa từng bán, nhưng món đó có thể đang nằm trong combo (`combo_item` có khoá ngoại tới `product`) | Món còn trong combo chưa xoá thì phải gỡ khỏi combo trước, trả 422 `BR-13` |
| R-09 | 04 | Mã đơn chứa ngày (BR-25) nhưng không nói ngày theo múi giờ nào. Đơn lúc 0h30 sáng giờ Việt Nam sẽ mang ngày hôm trước nếu dùng UTC | Ghi rõ dùng ngày theo `Asia/Ho_Chi_Minh` |
| R-10 | 01 | Ma trận phân quyền thiếu quyền Staff tạm tắt bán món khi hết nguyên liệu, trong khi API C-8 cho phép | Thêm dòng vào ma trận |
| R-11 | 01 | Actor Hệ thống chỉ nhắc job huỷ đơn và OTP, thiếu job trả yêu cầu nghỉ chưa duyệt về `REGISTERED` (BR-48) | Bổ sung |
| R-12 | 06 | Activity "xử lý đơn" trỏ tới Q-04 khi nói về việc sửa đơn, nhưng Q-04 là câu hỏi về cách tính lương | Thêm Q-06 "có cho sửa món sau khi đã thanh toán không" và trỏ đúng |
| R-13 | 01 | Bước gửi OTP báo "số đã có tài khoản", cho phép người lạ dò số điện thoại | Ghi vào mục Rủi ro, yêu cầu áp P-01 cả theo IP |
| R-14 | 05 | NFR-07 (nhân viên chỉ thấy 3 số cuối điện thoại khách) và NFR-01 (thời gian phản hồi) chưa được nhắc ở tầng API | Bổ sung vào O-4 và bảng quy ước |
| R-15 | 05 | Endpoint báo cáo đánh số `P-1` → `P-4`, trùng tiền tố với tham số nghiệp vụ `P-01` → `P-12` | Đổi thành `RP-1` → `RP-4` |

## 3. Rà soát lần 2: chuyển sang một quán (2026-11-13)

Hệ thống đổi từ nhiều quán sang **một quán duy nhất** (A-5). Sau khi sửa 01 → 08, rà soát lại toàn bộ theo cùng cách ở mục 1.

| Hạng mục | Kết quả |
|---|---|
| Mã tham chiếu | 32 FR, 7 NFR, 34 BR, 12 P, 23 UC, 5 Q. Các mã đã bỏ (FR-05, BR-03, BR-05, BR-20, UC-03, Q-05, S-1) chỉ còn xuất hiện trong ghi chú "đã bỏ", không còn nơi nào trỏ tới như một rule đang hiệu lực |
| `shop_id`, `{shopId}`, `/feed`, `/shops/` | 0 chỗ còn dùng, ngoài ghi chú lịch sử |
| Cú pháp Mermaid | 20/20 khối render được |

**Thay đổi chính**

- ERD: bỏ bảng `shop`, `shop_setting` và cột `shop_id` ở mọi bảng. Thêm `shop_info` một dòng (`CHECK (id = 1)`) chứa thông tin quán và tham số.
- API: bỏ `{shopId}` khỏi đường dẫn (`/shop`, `/menu`, `/orders`, `/reviews`, `/shifts`…), bỏ S-1 và bỏ `shopId` khỏi JWT.
- Rule: bỏ BR-03 (phạm vi quán), BR-05 (quán phải đang hoạt động), BR-20 (giỏ chỉ chứa món của một quán). Mã đơn đổi từ `CF-` sang `DH-YYMMDD-NNNN`.
- Màn hình: bỏ `/feed` và `/shops/[shopId]`. Trang chủ `/` hiện thông tin quán và menu.

**Lỗi phát hiện và đã sửa**

| # | Tài liệu | Vấn đề | Đã sửa |
|---|---|---|---|
| R-16 | 04 | Ghi chú `shop_info` nói chứa tham số P-06 → P-12, nhưng P-07 (chu kỳ polling) là tham số kỹ thuật, không có cột trong DDL | Ghi rõ P-06, P-08 → P-12. P-07 nằm trong cấu hình backend |
| R-17 | 06 | Activity 6 (job huỷ đơn) vẫn bước "lấy danh sách quán đang hoạt động", không còn đúng khi chỉ có một quán và không còn cờ `is_active` | Đổi thành đọc `payment_timeout_minutes` từ `shop_info` |
| R-18 | 05, 08 | Tên hàm `orderService.listByShop`, `reviewService.listByShop` không còn nghĩa | Đổi thành `orderService.listQueue`, `reviewService.list` |
| R-19 | 01 | Bỏ FR-05 và Q-05 nhưng không ghi chú, người đọc sẽ tưởng đánh số bị thiếu | Thêm ghi chú "đã bỏ, không dùng lại" |
| R-20 | 09 (R-05) | Khoá idempotency trước đây duy nhất trong quán | Nay duy nhất toàn hệ thống: `UNIQUE (idempotency_key)` |

## 4. Điểm còn mở

Những điểm sau không phải lỗi của đặc tả mà là quyết định nghiệp vụ. Thiết kế hiện dùng phương án mặc định, xem [01-dac-ta.md](01-dac-ta.md#10-câu-hỏi-mở):

- Q-01 → Q-04 và Q-06 chưa được business chốt.
- Mọi tham số P-01 → P-12 là **gợi ý**.
- Thông báo (BR-42) chỉ hiện trong ứng dụng. Nếu nhân viên ít khi mở ứng dụng, cần cân nhắc gửi SMS hoặc Zalo cho trường hợp huỷ ca sát giờ.
- Backend cũ đang trả thẳng `user` cho `POST /api/customer/login`. Frontend chấp nhận cả hai dạng response trong giai đoạn chuyển tiếp ([05-api.md](05-api.md#21-xác-thực-và-tài-khoản)).
