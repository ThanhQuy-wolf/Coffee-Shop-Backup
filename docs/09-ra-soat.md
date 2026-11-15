# 09 — Biên bản rà soát đặc tả

Rà soát toàn bộ tài liệu 01 → 08 sau khi viết xong, trước khi sửa frontend. Lần 2 (mục 3) rà soát sau khi chuyển sang một quán. Lần 3 (mục 4) rà soát sau khi thêm tuỳ chọn món. Lần 5 (mục 6) đối chiếu đặc tả khi viết backend đợt 1, lần 6 (mục 7) khi viết đợt 2, lần 7 (mục 8) khi viết đợt 3. Mục tiêu: các mã tham chiếu khớp nhau, dữ liệu đủ để thực thi từng rule, có đủ luồng ngoại lệ, và mọi sơ đồ Mermaid hiển thị được.

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

## 4. Rà soát lần 3: tuỳ chọn món (2026-11-14)

Thêm tính năng tuỳ chọn món (size, mức đường, mức đá, topping). Rà soát lại 01 → 08 theo cùng cách ở mục 1.

| Hạng mục | Kết quả |
|---|---|
| Mã tham chiếu | 35 FR, 7 NFR, 38 BR, 12 P, 24 UC, 6 Q. Mã mới: FR-34 → FR-36, BR-16 → BR-19, UC-25, Q-07, A-10, API C-15 → C-19. Không mã nào bị trỏ tới mà chưa định nghĩa, ngoài các mã đã bỏ trong ghi chú |
| Cú pháp Mermaid | 20/20 khối render được bằng `mermaid` 11.4.1 |
| Độ phủ | FR-34 → FR-36 đều có UC, API và màn hình trong [08-truy-vet.md](08-truy-vet.md) |

**Thay đổi chính**

- ERD: thêm `option_group`, `option_value`, `product_option_group` (nhóm dùng chung, gắn vào món) và `order_item_option` (chụp lựa chọn vào đơn).
- Rule: BR-16 (cấu trúc nhóm), BR-17 (giá chênh), BR-18 (lựa chọn hợp lệ khi đặt), BR-19 (tắt, xoá giá trị). Mở rộng BR-21 → BR-24 cho tuỳ chọn.
- API: C-15 → C-19 cho nhóm tuỳ chọn, `optionGroupIds` trong C-6/C-7, `optionGroups` trong S-6, `optionValueIds` và `options` trong O-1.
- Màn hình: hộp chọn tuỳ chọn ở `/`, tab Tuỳ chọn ở `/manager`, ô Tuỳ chọn đang hết ở `/staff/orders`, dòng tuỳ chọn dưới mỗi món ở giỏ, `/checkout`, `/orders/[orderId]`, `/staff/orders`.

**Lỗi phát hiện và đã sửa**

| # | Tài liệu | Vấn đề | Đã sửa |
|---|---|---|---|
| R-21 | 02 | BR-22 so giá trong giỏ với giá món. Với món có tuỳ chọn, giá khách thấy đã cộng phần chênh nên luôn lệch, đơn nào cũng bị từ chối | BR-22 so với đơn giá đã cộng giá chênh (BR-17) |
| R-22 | 02, 05 | BR-24 so "nội dung giỏ" khi gửi lại cùng khoá, nhưng không nói lựa chọn có tính là nội dung không. Đổi topping rồi gửi lại cùng khoá sẽ nhận đơn cũ sai lựa chọn | Ghi rõ khác lựa chọn cũng là khác nội dung |
| R-23 | 02, 04 | Tắt giá trị cuối cùng còn bán của một nhóm bắt buộc làm món không đặt được, nhưng menu vẫn hiện món là đang bán | BR-19: món coi như tạm hết, kéo theo combo chứa món (BR-13) |
| R-24 | 01, 02 | Combo chứa món có nhóm bắt buộc (ví dụ Size) nhưng combo không có chỗ lưu lựa chọn | Giả định A-10: món trong combo pha theo mặc định. Mở Q-07 cho business chốt. BR-18 cấm gửi lựa chọn ở dòng combo |
| R-25 | 04 | Lợi nhuận (BR-51) dùng `unit_cost` của dòng, nhưng size L tốn nguyên liệu hơn size M | Thêm `cost_delta` cho giá trị và cộng vào `unit_cost` khi chụp (BR-17) |
| R-26 | 05 | Lỗi `BR-21`, `BR-22` của O-1 chỉ ra mục bằng `itemType` và `id`. Khi cùng một món nằm ở hai dòng khác tuỳ chọn, frontend không biết dòng nào bị lỗi | Thêm `line` (vị trí trong `items` của request) vào mọi phần tử `errors[]` của O-1 |

## 5. Rà soát lần 4: tuỳ chọn trong combo (2026-11-14)

Business chốt Q-07 theo phương án (b): món trong combo được chọn tuỳ chọn, giá chênh cộng vào dòng combo. Đồng thời bỏ danh mục "Topping" cũ trong dữ liệu mẫu, vì topping nay là nhóm tuỳ chọn chứ không còn là món bán lẻ.

| Hạng mục | Kết quả |
|---|---|
| Mã tham chiếu | 36 FR, 7 NFR, 38 BR, 12 P, 24 UC, 5 Q còn mở. Mã mới: FR-37. Sửa A-10, BR-17, BR-18, BR-22, BR-23. Q-07 đã chốt |
| Cú pháp Mermaid | 20/20 khối render được bằng `mermaid` 11.4.1 |
| Độ phủ | FR-37 có UC-05, API O-1 và màn hình `/` trong [08-truy-vet.md](08-truy-vet.md) |

**Thay đổi chính**

- ERD: `order_item_option` thêm `component_no`, `component_product_id`, `component_name_snapshot` để ghi lựa chọn của từng ly trong combo.
- API: dòng `COMBO` của O-1 gửi `components[]` (`no`, `optionValueIds`). Response trả `options` của dòng combo kèm `componentNo`, `componentName`. Lỗi `BR-18` ở một ly có thêm `componentNo`.
- Màn hình: hộp chọn tuỳ chọn mở cho cả combo, chia theo từng ly. Giỏ, `/checkout`, `/orders/[orderId]` và `/staff/orders` hiện lựa chọn dưới từng ly.

**Lỗi phát hiện và đã sửa**

| # | Tài liệu | Vấn đề | Đã sửa |
|---|---|---|---|
| R-27 | 01, 02 | Chốt "cho chọn trong combo" nhưng chưa nói chọn một lần cho cả combo hay cho từng ly. Combo 2 Trà Đào thường là hai người uống, mỗi người một mức đường | A-10: chọn theo từng ly, đánh số `no` theo thứ tự `combo_item` và số lượng |
| R-28 | 02, 05 | Nếu chỉ gửi ly nào khách đổi lựa chọn thì ly có nhóm bắt buộc mà không được gửi sẽ thiếu Size | BR-18: ly không gửi coi như chọn rỗng nên vẫn bị kiểm nhóm bắt buộc. Frontend gửi mọi ly có nhóm tuỳ chọn |
| R-29 | 04 | Lưu lựa chọn của ly chỉ bằng số thứ tự thì khi quản lý sửa thành phần combo, đơn cũ không còn biết ly 1 là món gì | Chụp `component_product_id` và `component_name_snapshot` cùng hàng lựa chọn |
| R-30 | 02 | BR-17 chỉ định nghĩa đơn giá và giá vốn của dòng món. Báo cáo lợi nhuận sẽ bỏ sót giá vốn chênh của size L trong combo | BR-17 thêm công thức cho dòng combo |

## 6. Rà soát lần 5: backend đợt 1 (2026-11-15)

Viết backend Spring Boot cho A-1 → A-9 và S-2 → S-6, chạy DDL ở mục 3 của [04-erd.md](04-erd.md) nguyên văn bằng Flyway trên PostgreSQL 17, rồi gọi API thật để đối chiếu với 02 và 05.

| Hạng mục | Kết quả |
|---|---|
| DDL 04-erd §3 | Chạy được nguyên văn, Hibernate `ddl-auto: validate` khớp mọi bảng đợt 1 |
| Mã lỗi nhóm A, S | 401/423 `BR-04`, 422 `BR-01`, 422/429 `BR-02`, 400 `VALIDATION`, 401 `UNAUTHENTICATED`, 403 `FORBIDDEN` đều trả `application/problem+json` |
| Test | 19 test tích hợp (Testcontainers) pass |
| Mã tham chiếu | Không thêm FR, BR, UC. Không có mã mới |

**Điểm đặc tả chưa nói rõ, đã chốt khi code**

| # | Tài liệu | Vấn đề | Cách xử lý |
|---|---|---|---|
| R-31 | 05 | S-6 công khai nhưng kiểu `Product` có `costPrice`, `OptionValue` có `costDelta`. Trả nguyên thì ai cũng xem được giá vốn | Menu công khai bỏ hai trường này. API quản lý C-5, C-15 vẫn trả |
| R-32 | 05 | A-6 không nói thu hồi phiên nào khi client không gửi refresh token | Body tuỳ chọn `{ refreshToken }`. Không gửi thì thu hồi mọi phiên |
| R-33 | 05 | A-5 không nói gì về refresh token bị dùng lại | Token đã thu hồi mà bị gửi lại thì thu hồi mọi phiên của người đó (phát hiện token bị lộ) |
| R-34 | 02, 05 | BR-04 không nói lần sai thứ P-04 trả 401 hay 423 | Trả 423 kèm `lockedUntil` ngay ở lần đó, để giao diện hiện giờ mở khoá |
| R-35 | 05 | A-8 cần `message`, nhưng bảng `notification` chỉ có `type` và `payload` | Service tạo thông báo ghi câu hiển thị vào `payload.message` |
| R-36 | 01, 04 | A-5 nói thông tin quán "được tạo sẵn lúc cài đặt" nhưng không có dữ liệu ban đầu | Migration `V2` tạo dòng `shop_info` và 4 bộ phận. Tài khoản demo và menu mẫu chỉ có ở profile `dev` |

## 7. Rà soát lần 6: backend đợt 2, quản lý menu (2026-11-15)

Viết C-1 → C-19. Thêm migration `V3__combo_item_sort_order.sql`.

| Hạng mục | Kết quả |
|---|---|
| Mã tham chiếu | Không thêm FR, BR, UC. 04 thêm cột `combo_item.sort_order` |
| Test | Thêm test tích hợp cho danh mục, món, combo, tuỳ chọn |

**Điểm đặc tả chưa nói rõ, đã chốt khi code**

| # | Tài liệu | Vấn đề | Cách xử lý |
|---|---|---|---|
| R-37 | 01, 04 | A-10 đánh số ly "theo thứ tự `combo_item`" nhưng bảng không có cột thứ tự (điểm còn mở ở lần 5) | Thêm `combo_item.sort_order`, lưu theo thứ tự `items` quản lý gửi lên |
| R-38 | 04 | BR-14 chỉ xét `order_item`. Món thuộc combo đã xoá mềm vẫn còn hàng `combo_item`, xoá cứng món sẽ vướng khoá ngoại | Món còn được `combo_item` hoặc `order_item_option.component_product_id` trỏ tới thì xoá mềm |
| R-39 | 04 | BR-19 tương tự: nhóm gắn vào món đã xoá mềm vẫn còn hàng `product_option_group` | Nhóm còn hàng `product_option_group` thì xoá mềm |
| R-40 | 05 | Không có rule cho tên danh mục trùng, nhưng DDL có unique index `uq_category_name` | Trả 400 `VALIDATION`, không thêm BR |
| R-41 | 02 | BR-15 nói ghi `audit_log` khi đổi giá nhưng không nói khuôn dữ liệu | `action` = `PRICE_CHANGED`, `entity_type` = `PRODUCT`, `COMBO` hoặc `OPTION_VALUE`, before/after chỉ chứa các cột giá |

## 8. Rà soát lần 7: backend đợt 3, đơn hàng (2026-11-15)

Viết O-1 → O-9 và job BR-28. Thêm migration `V4__order_request_fingerprint.sql`.

| Hạng mục | Kết quả |
|---|---|
| Mã tham chiếu | Không thêm FR, BR, UC. 04 thêm cột `customer_order.request_fingerprint` |

**Điểm đặc tả chưa nói rõ, đã chốt khi code**

| # | Tài liệu | Vấn đề | Cách xử lý |
|---|---|---|---|
| R-42 | 02, 04 | BR-24 bắt so "nội dung giỏ" khi gửi lại cùng khoá, nhưng đơn không lưu request gốc | Thêm `customer_order.request_fingerprint` (SHA-256 của request cộng người đặt) |
| R-43 | 05 | O-1 là `Public, C` nhưng không nói gì về token của nhân viên | Trả 403 `FORBIDDEN`, giống frontend mock |
| R-44 | 05 | Quy ước chung là phân trang, nhưng frontend gọi O-3 và O-4 nhận mảng | Trả mảng. O-3 giới hạn 50 đơn gần nhất, O-4 mặc định là đơn của hôm nay |
| R-45 | 05 | O-9 không nói thứ tự kiểm khi vừa lệch `version` vừa sai trạng thái | Kiểm `version` trước (`BR-27`), rồi trạng thái (`ORDER_STATE`), rồi quyền (`BR-29`) |
| R-46 | 05 | `ETag` của O-2 "theo `version`" bỏ sót trường hợp khách vừa đánh giá, vì đánh giá không tăng `version` | `ETag` gồm `version` và id đánh giá |
| R-47 | 01 | NFR-03 bắt ghi audit khi xác nhận thanh toán và huỷ đơn đã thanh toán, nhưng chưa có tên action | `PAYMENT_CONFIRMED`, `ORDER_REFUNDED` |

## 9. Rà soát lần 8: backend đợt 4, đánh giá và ca làm (2026-11-15)

Viết R-1, R-2, W-1 → W-12 và job BR-48. Không thêm migration.

| Hạng mục | Kết quả |
|---|---|
| Mã tham chiếu | Không thêm FR, BR, UC |

**Điểm đặc tả chưa nói rõ, đã chốt khi code**

| # | Tài liệu | Vấn đề | Cách xử lý |
|---|---|---|---|
| R-48 | 05 | R-1 không ghi response, và trường `review` của O-2 chưa có kiểu | Cả hai dùng kiểu `Review` của frontend: `id`, `orderId`, `orderCode`, `customerName`, `rating`, `comment`, `createdAt` |
| R-49 | 05 | Bảng lỗi xếp `BR-31` vào 422 nhưng frontend coi đánh giá trùng là vi phạm rule, không phải xung đột | Đánh giá trùng trả 422 `BR-31`. Đánh giá đơn của người khác trả 422 `BR-30` như frontend, không trả 404 |
| R-50 | 05 | W-5, W-6 không nói mã lỗi khi ca đã huỷ | Trả 409 `ORDER_STATE`, giống frontend. Đợt 5 có thể đổi tên mã chung nếu muốn |
| R-51 | 05 | Thứ tự kiểm của W-7 khi vi phạm nhiều rule cùng lúc | `BR-46` → `BR-44` → `BR-43` → `BR-45`, giống frontend |
| R-52 | 02, 05 | BR-45 cần chặn hai lệnh đăng ký song song của cùng một người vào hai ca trùng giờ, mà khoá dòng ca (§4) không chặn được | Khoá thêm dòng `app_user` của người đăng ký |
| R-53 | 01 | NFR-03 bắt ghi audit khi chấm công nhưng chưa có tên action | `ATTENDANCE_MARKED`, kèm trạng thái trước và sau |
| R-54 | 05 | BR-48 trả phân ca về `REGISTERED` bằng job mỗi phút, nên trong tối đa một phút sau giờ bắt đầu, W-10 có thể duyệt một yêu cầu đã hết hạn | W-10, W-11 chạy bước của job trước khi kiểm |

## 10. Rà soát lần 9: backend đợt 5, báo cáo và nối frontend (2026-11-15)

Viết RP-1 → RP-4 và nối toàn bộ `frontend/lib/services` vào backend, xoá `frontend/lib/mock-data`. Không thêm migration.

| Hạng mục | Kết quả |
|---|---|
| Mã tham chiếu | Không thêm FR, BR, UC |
| Chạy thử | Frontend gọi backend thật: 15 bước end-to-end qua (khách đặt món, hai nhân viên cùng xác nhận một đơn, đánh giá, làm mới token, thống kê, ca làm, đăng xuất) |

**Điểm đặc tả chưa nói rõ, đã chốt khi code**

| # | Tài liệu | Vấn đề | Cách xử lý |
|---|---|---|---|
| R-55 | 05 | RP-2 không nói mốc thời gian của từng kỳ | Ngày theo giờ, tuần và tháng theo ngày, năm theo tháng. Mốc trống vẫn trả về với giá trị 0 |
| R-56 | 05 | Hai kỳ dài khác nhau (tháng 2 và tháng 3) thì không ghép được hai nửa theo nhãn | Ghép theo vị trí. Kỳ trước thiếu mốc thì mốc đó có nhãn rỗng và giá trị 0 |
| R-57 | 05 | RP-3 không nói xử lý dòng combo, và một món bán nhiều giá (size, topping) thì giá vốn, giá bán là bao nhiêu | Bỏ qua dòng combo (doanh thu combo vẫn có ở RP-1, RP-2). Giá vốn và giá bán là trung bình một ly |
| R-58 | 05 | R-2 trả 500 khi quán chưa có đánh giá nào (`avg` trả NULL) | Sửa backend trả `average` = 0, thêm test |
| R-59 | 05 | Lệnh gọi API đầu tiên sau khi tải trang đi trước khi đọc được phiên đăng nhập, nên trang đơn của khách báo "không tìm thấy" trong vài giây | Client chờ `AuthProvider` đọc xong phiên rồi mới gửi. Trang đơn chờ đọc xong guest token |
| R-60 | 05 | Đăng xuất xoá access token trước khi lệnh A-6 kịp gửi, nên A-6 trả 401 và refresh token không bị thu hồi | `authService.logout` lấy cả hai token ngay khi được gọi |
| R-61 | 01 | Thẻ thống kê ghi "chỉ tính đơn hoàn tất", trái với BR-50 | Đổi chữ thành "tính theo lúc thu tiền" và "Đơn đã thanh toán, chưa bị huỷ" |

## 11. Điểm còn mở

Những điểm sau không phải lỗi của đặc tả mà là quyết định nghiệp vụ. Thiết kế hiện dùng phương án mặc định, xem [01-dac-ta.md](01-dac-ta.md#10-câu-hỏi-mở):

- Q-01 → Q-04 và Q-06 chưa được business chốt. Q-07 đã chốt ở mục 5.
- Mọi tham số P-01 → P-12 là **gợi ý**.
- Thông báo (BR-42) chỉ hiện trong ứng dụng. Nếu nhân viên ít khi mở ứng dụng, cần cân nhắc gửi SMS hoặc Zalo cho trường hợp huỷ ca sát giờ.
- Chưa có nhà cung cấp SMS. Backend ghi OTP ra log (`LogOtpSender`), profile `dev` dùng mã cố định `123456`.
- Chưa có cách tạo tài khoản Manager đầu tiên ở production. Tài khoản `admin` chỉ có trong dữ liệu demo của profile `dev`.
- `orderService.now()` và `shiftService.now()` dùng đồng hồ trình duyệt. Máy khách lệch giờ thì đếm ngược thanh toán lệch theo, nhưng hạn thật vẫn do backend quyết định (BR-28).
