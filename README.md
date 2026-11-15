# Drinkool

Hệ thống đặt đồ uống cho một quán: khách xem menu, đặt món, thanh toán tiền mặt
hoặc QR; nhân viên xử lý đơn và đăng ký ca; quản lý vận hành thực đơn, ca làm
và xem báo cáo.

## Thư mục

| Thư mục | Nội dung |
|---|---|
| [`docs/`](docs/README.md) | Đặc tả nghiệp vụ, business rules, use case, ERD PostgreSQL, bảng API, activity, sequence, truy vết, biên bản rà soát |
| [`backend/`](backend/README.md) | Spring Boot 4.1 (Java 21), PostgreSQL 17, Flyway, JWT. REST API ở `/api/v1` |
| [`frontend/`](frontend/README.md) | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 |

Backend đã có đủ API trong [docs/05-api.md](docs/05-api.md). Frontend gọi
`/api/*`, Next.js chuyển tiếp tới backend.

## Chạy nhanh

Cần Docker và Node.js 20 trở lên.

```bash
docker compose up -d --build    # PostgreSQL (5432) + backend (http://localhost:8080)

cd frontend
npm install
npm run dev                     # http://localhost:3000, /api/* chuyển tới localhost:8080
```

- Lần đầu build image backend mất vài phút vì Maven tải thư viện. Sửa code
  backend xong thì chạy lại `docker compose up -d --build backend`.
- Xem log backend: `docker compose logs -f backend`. Dừng: `docker compose down`
  (thêm `-v` để xoá luôn dữ liệu database).
- Compose chạy backend với profile `dev`: nạp tài khoản demo và menu mẫu, OTP luôn
  là `123456` (xem [backend/README.md](backend/README.md)). Tài khoản: quản lý
  `admin` / `admin`, nhân viên `an` / `123456`, khách `0987654321` / `user1`.
- Backend ở địa chỉ khác thì đặt `API_PROXY_URL` trước khi chạy frontend, ví dụ
  `API_PROXY_URL=http://192.168.1.10:8080 npm run dev`.

Phát triển backend không qua Docker: `docker compose up -d postgres`, rồi
`cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`. Chạy test:
`./mvnw -B -ntp verify` (cần Docker cho Testcontainers).

## CI/CD

| Workflow | Khi nào chạy | Làm gì |
|---|---|---|
| `.gitea/workflows/release.yaml` | Push hoặc PR vào `main` | Build frontend, release, đẩy image `frontend` lên registry |
| `.gitea/workflows/backend-ci.yaml` | Push hoặc PR vào `main` có đổi `backend/` | `./mvnw -B -ntp verify` (unit + integration test với Testcontainers) |

Docker build từ `frontend/` (`docker build -t drinkool-frontend frontend`) và
`backend/` (`docker build -t drinkool-backend backend`).
