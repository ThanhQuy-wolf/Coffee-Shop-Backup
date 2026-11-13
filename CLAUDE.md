# CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc trong repo này. Tổng quan kiến trúc, cách chạy và quy ước code: xem [README.md](README.md).
Việc cần làm: [backend/TODO.md](backend/TODO.md), [frontend/TODO.md](frontend/TODO.md).

## 1. Git commit

- Chỉ commit khi tôi yêu cầu.
- **Không** thêm bất kỳ dòng attribution nào của Claude vào commit message: không `Co-Authored-By: Claude ...`,
  không `Generated with Claude Code`, không ghi Claude là author/co-author. Quy tắc này áp dụng cho cả PR description.
- Commit dùng git user đã cấu hình sẵn trong máy, không sửa `user.name` / `user.email`.

## 2. "Code" khác với "chỉ tôi"

Phân biệt theo cách tôi nhờ:

| Tôi nói | Claude làm |
|---|---|
| "code", "viết", "làm", "sửa", "implement", "thêm tính năng" | Viết/sửa code trực tiếp vào file trong repo. |
| "chỉ tôi", "hướng dẫn", "giải thích cách làm", "làm sao để" | **Không sửa file nào.** Chỉ trả lời trong khung chat. |

Khi ở chế độ **"chỉ tôi"**, câu trả lời phải có đủ:

1. **Code mẫu** – đặt trong code block, bám theo cấu trúc và quy ước thực tế của repo (package, tên class, `SystemClock`, `BusinessRuleException`, `EventEnvelope`, `postIdempotent()`...).
2. **Tại sao làm như vậy** – lý do chọn cách này, so với cách khác thì hơn/kém gì, liên quan tới yêu cầu nghiệp vụ nào (BR-xx).
3. **Lý thuyết** – khái niệm nền tảng đằng sau (ví dụ: outbox pattern, idempotency, saga, event-driven, optimistic locking, RFC 9457...).
4. **Giải thích các hàm/annotation/API** dùng trong code mẫu – mỗi hàm làm gì, tham số, giá trị trả về, lưu ý khi dùng.
5. Chỉ ra **file nào trong repo** tôi cần tạo/sửa để tự áp dụng.

Nếu không rõ tôi muốn "code" hay "chỉ", hỏi lại trước khi sửa file.

## 3. Test end-to-end sau mỗi task tính năng

Sau khi hoàn thành một task liên quan đến tính năng/feature, **bắt buộc test lại end-to-end** trước khi báo xong:

1. Build và chạy unit/integration test:
   - Backend: `cd backend && ./mvnw -B -ntp verify` (hoặc `-pl <module> -am` cho module bị ảnh hưởng)
   - Frontend: `cd frontend && npm run lint && npm run build` (và `npm test` khi đã có test runner)
2. Chạy hệ thống thật: `docker compose up -d` cho hạ tầng, chạy gateway + các service liên quan.
3. Gọi API **qua gateway** (`http://localhost:8080/api/v1/...`) theo đúng luồng nghiệp vụ của tính năng,
   kiểm tra cả case thành công lẫn case vi phạm business rule (phải trả `application/problem+json` có `rule`).
4. Nếu tính năng phát event: kiểm tra event đi qua `library.events` và service consumer xử lý đúng (kể cả gửi trùng `eventId`).
5. Nếu có UI: chạy `npm run dev` và thao tác thử trên trình duyệt.
6. Báo cáo trung thực kết quả: lệnh đã chạy, kết quả pass/fail, bước nào không chạy được và vì sao.

## 4. Thêm tính năng thì thêm test vào CI/CD

- Mỗi tính năng mới phải kèm test tự động nằm trong pipeline CI (`.github/workflows/`):
  - Backend: test đặt trong `src/test/java` của module tương ứng → tự chạy bởi `./mvnw verify` trong `backend-ci.yml`.
    Ưu tiên test service layer (rule nghiệp vụ) + test controller/integration cho endpoint mới.
  - Frontend: hiện chưa có test runner. Khi thêm tính năng frontend đầu tiên cần test, thiết lập Vitest (+ Testing Library),
    thêm script `"test"` vào `package.json` và bước `npm test` vào `frontend-ci.yml`.
  - Luồng nghiệp vụ xuyên nhiều service (mượn → trả → phạt, đặt trước, ILL...): bổ sung test E2E chạy được trong CI
    (ví dụ job dùng `docker compose` hoặc Testcontainers).
- Nếu cần job/workflow mới thì cập nhật luôn bảng CI/CD trong README.md.
- Không tắt, skip hay xoá test hiện có để pipeline xanh.

## 5. Comment trong code

- Không comment thừa: không diễn giải lại điều code đã nói rõ (`// tăng i lên 1`, `// gọi API`, `// set state`),
  không comment kiểu nhật ký thay đổi (`// sửa lỗi X`, `// thêm theo yêu cầu`), không để code cũ bị comment-out.
- Chỉ comment chỗ trọng tâm: **tại sao** làm vậy, ràng buộc nghiệp vụ (BR-xx), edge case, workaround, chỗ dễ hiểu sai.
- Viết như người thật giải thích cho đồng đội: ngắn, tự nhiên, đúng giọng trong repo; tránh văn mẫu, liệt kê máy móc
  hay JSDoc/Javadoc cho hàm mà tên và tham số đã tự giải thích.
