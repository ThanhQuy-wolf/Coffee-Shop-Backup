# Drinkool

Hệ thống đặt đồ uống cho một quán: khách xem menu, đặt món, thanh toán tiền mặt
hoặc QR; nhân viên xử lý đơn và đăng ký ca; quản lý vận hành thực đơn, ca làm
và xem báo cáo.

## Thư mục

| Thư mục | Nội dung |
|---|---|
| [`docs/`](docs/README.md) | Đặc tả nghiệp vụ, business rules, use case, ERD PostgreSQL, bảng API, activity, sequence, truy vết, biên bản rà soát |
| [`frontend/`](frontend/README.md) | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 |

Backend chưa có trong repo. Frontend gọi `/api/*`; endpoint nào chưa có thì
trả lời từ dữ liệu giả trong `frontend/lib/mock-data`.

## Chạy nhanh

```bash
cd frontend
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint && pnpm build
```

Docker build từ `frontend/` (`docker build -t drinkool-frontend frontend`).
CI (`.gitea/workflows/release.yaml`) chạy các bước trong `frontend/`.
