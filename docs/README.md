# Tài liệu đặc tả — Hệ thống bán cà phê Drinkool

Bộ tài liệu này mô tả nghiệp vụ và thiết kế mục tiêu cho hệ thống. Backend chưa được xây dựng, nên đây là **thiết kế to-be**. Frontend trong `../frontend` được tối ưu để bám theo tài liệu này: kiểu dữ liệu trong `lib/types.ts` khớp với ERD, và mỗi API ở đây có một hàm tương ứng trong `lib/services/` (hiện vẫn trả dữ liệu mock).

| # | Tài liệu | Nội dung |
|---|---|---|
| 1 | [01-dac-ta.md](01-dac-ta.md) | Bối cảnh, mục tiêu, phạm vi, actor, giả định, yêu cầu chức năng (FR) và phi chức năng (NFR), vòng đời trạng thái, câu hỏi mở |
| 2 | [02-business-rules.md](02-business-rules.md) | Business rule (BR-xx) và tham số cấu hình |
| 3 | [03-usecase.md](03-usecase.md) | Sơ đồ use case, danh sách UC, đặc tả các UC chính |
| 4 | [04-erd.md](04-erd.md) | ERD PostgreSQL, từ điển dữ liệu, ràng buộc và index |
| 5 | [05-api.md](05-api.md) | Quy ước API, bảng endpoint, mã lỗi |
| 6 | [06-activity.md](06-activity.md) | Activity diagram cho các quy trình chính |
| 7 | [07-sequence.md](07-sequence.md) | Sequence diagram cho các luồng tương tác chính |
| 8 | [08-truy-vet.md](08-truy-vet.md) | Ma trận truy vết UC → FR → BR → API → màn hình frontend |
| 9 | [09-ra-soat.md](09-ra-soat.md) | Biên bản rà soát đặc tả và các lỗi đã sửa |

Tất cả sơ đồ đều viết bằng [Mermaid](https://mermaid.js.org/), nên Gitea, GitHub và VS Code (có extension Markdown Preview Mermaid) đều hiển thị được trực tiếp.

## Quy ước mã

| Tiền tố | Ý nghĩa | Ví dụ |
|---|---|---|
| `UC-xx` | Use case | UC-07 Đặt món |
| `FR-xx` | Yêu cầu chức năng | FR-12 |
| `NFR-xx` | Yêu cầu phi chức năng | NFR-03 |
| `BR-xx` | Business rule. Backend trả mã này trong trường `rule` khi từ chối request | BR-21 |
| `P-xx` | Tham số nghiệp vụ, do chủ quán hoặc vận hành chốt | P-03 Thời hạn OTP |
| `Q-xx` | Câu hỏi mở cần business chốt | Q-02 |

## Thuật ngữ

| Thuật ngữ | Nghĩa trong hệ thống |
|---|---|
| Quán (shop) | Cửa hàng đồ uống duy nhất mà hệ thống phục vụ. Thông tin quán nằm trong bảng `shop_info` một dòng |
| Khách vãng lai | Người chưa đăng nhập. Được xem menu và đặt món, nhưng không xem được lịch sử đơn và không đánh giá được |
| Món (product) | Một đồ uống hoặc đồ ăn bán lẻ, thuộc đúng một danh mục |
| Combo | Gói nhiều món, có giá riêng |
| Đơn (order) | Một lần đặt món tại quán. Giá được "đóng băng" vào đơn tại thời điểm đặt |
| Ca (shift) | Một khung giờ làm việc của một bộ phận trong một ngày, có số người tối đa và mức lương mỗi ca |
| Phân ca (shift assignment) | Việc một nhân viên đăng ký vào một ca. Trạng thái nghỉ phép và vắng mặt nằm ở đây, không nằm ở ca |
