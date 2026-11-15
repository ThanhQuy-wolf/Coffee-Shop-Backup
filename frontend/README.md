# Coffee Shop Frontend

Dự án Frontend cho hệ thống đặt món cà phê, xây dựng bằng Next.js App Router,
React 19, TypeScript và Tailwind CSS v4.

---

## Mô Tả Dự Án

Frontend của Drinkool, hệ thống đặt đồ uống cho **một quán duy nhất** (không có
`shopId`, mọi nhân viên và quản lý thuộc quán này). Đặc tả nghiệp vụ, ERD, bảng
API và sơ đồ nằm ở `../docs/`. Frontend bám theo đặc tả đó:

- `lib/types.ts` khớp ERD (`docs/04-erd.md`).
- Mỗi API trong `docs/05-api.md` có một hàm trong `lib/services/`.
- Mỗi màn hình ứng với các use case trong `docs/03-usecase.md` (bảng truy vết:
  `docs/08-truy-vet.md`, bảng route: `app/APP.md`).

### Tính Năng

| Vai trò                     | Màn hình                              | Chức năng                                                                                                                                                         |
| --------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Khách (không cần tài khoản) | `/`, `/checkout`, `/orders/[id]`      | Xem thông tin quán và menu ở trang chủ, giỏ hàng, đặt món tiền mặt hoặc QR, theo dõi đơn, huỷ đơn chưa thanh toán, đặt lại khi đơn hết hạn                        |
| Khách có tài khoản          | thêm `/register`, `/orders`           | Đăng ký bằng OTP, lịch sử đơn, đánh giá đơn đã hoàn tất                                                                                                           |
| Nhân viên                   | `/staff/orders`, `/staff/schedule`    | Xác nhận thanh toán, pha chế, giao món, huỷ đơn chưa thanh toán; đăng ký ca, huỷ ca, xin nghỉ                                                                     |
| Quản lý                     | thêm `/manager`, `/manager/analytics` | CRUD món, combo, danh mục; thông tin quán và tham số; xem đánh giá; tạo, sửa, huỷ ca, duyệt nghỉ, chấm công; huỷ đơn đã thanh toán; thống kê doanh thu, lợi nhuận |

Backend mới có `POST /api/customer/login`. Các API khác trả lời từ backend giả
trong `lib/mock-data/` (xem `lib/LIB.md`), có kiểm tra đủ các business rule
`BR-xx` nên giao diện đã xử lý đúng mã lỗi thật. Dữ liệu giả reset khi tải lại
trang.

---

## Cách Chạy Dự Án

### Yêu cầu hệ thống

- Node.js >= 18
- pnpm (dự án chỉ dùng `pnpm-lock.yaml`)

### Cài đặt

```bash
pnpm install
```

### Dev

```bash
pnpm dev
```

Mở trình duyệt tại http://localhost:3000

### Build

```bash
pnpm build && pnpm start
```

### Lint & Format

```bash
pnpm lint
pnpm format
```

### Docker

```bash
docker build -t drinkool-frontend .
docker run -p 3000:3000 drinkool-frontend
```

Image dùng bản build `standalone` của Next.js (xem `dockerfile`). Khi chạy
`pnpm dev`, `/api/*` được chuyển tiếp tới backend ở
`http://host.docker.internal:32080`; đặt biến `API_PROXY_URL` để đổi địa chỉ.

### Release

```bash
pnpm release
```

---

## Cấu Trúc Thư Mục

```
frontend/
+-- app/            # Route (bảng đầy đủ: app/APP.md)
|   +-- (main)/     # / (menu), /checkout, /orders, /orders/[orderId], /login, /register
|   +-- (staff)/    # /staff/orders, /staff/schedule
|   +-- (manager)/  # /manager, /manager/analytics
+-- components/     # Atomic Design: atoms, molecules, organisms, templates (COMPONENTS.md)
+-- layouts/        # header.tsx, footer.tsx (LAYOUTS.md)
+-- lib/            # types, services, mock-data, contexts, hooks, utils (LIB.md)
+-- public/         # logo, favicon, ảnh món mặc định
+-- scripts/        # release
+-- dockerfile, next.config.ts, package.json, pnpm-lock.yaml ...
```

---

## Công Nghệ Sử Dụng

| Công nghệ        | Phiên bản | Mục đích                              |
| ---------------- | --------- | ------------------------------------- |
| Next.js          | 16.1.7    | React Framework (App Router)          |
| React            | 19.2.3    | Thư viện UI                           |
| TypeScript       | ^5        | Kiểu dữ liệu tĩnh                     |
| Tailwind CSS     | ^4.2.2    | Utility-first CSS framework           |
| Be Vietnam Pro   | -         | Font chữ (Google Fonts via next/font) |
| lucide-react     | 1.64.0    | Icon SVG, đóng gói cùng app           |
| pnpm             | -         | Package manager                       |
| ESLint           | ^9        | Linting                               |
| Prettier         | ^3        | Code formatting                       |
| semantic-release | ^25       | Automated versioning & release        |

---

## Ghi Chú Phát Triển

### Tài Khoản Demo

| Loại tài khoản     | Tab đăng nhập  | Tài khoản       | Mật khẩu                 |
| ------------------ | -------------- | --------------- | ------------------------ |
| Quản lý            | Nhân viên quán | admin           | admin                    |
| Nhân viên          | Nhân viên quán | an, binh, cuong | 123456                   |
| Khách hàng         | Khách hàng     | 0987654321      | user1 (qua backend thật) |
| Mã OTP khi đăng ký |                |                 | 123456                   |

### Design & Styling

- Design tokens (CSS variables) định nghĩa trong `app/globals.css`
- Tailwind CSS v4 + custom properties cho consistent color/spacing
- Màu trạng thái dùng token `--color-success|danger|warning|info` (và `-bg`),
  không viết cứng `text-red-600`, `bg-emerald-50`...
- Chữ phụ `--color-text-muted` và `--color-accent-strong` đạt tương phản WCAG AA
  (≥ 4,5:1); `--color-accent` chỉ dùng cho icon hoặc chữ trên nền tối.
- Dark mode: biến CSS đã chuẩn bị sẵn nhưng chưa kích hoạt
- Icon: atom `Icon` (lucide-react), không tải từ CDN; nút chỉ có icon phải có
  `aria-label`
- Mobile: mỗi màn hình thử ở 390px; bảng chuyển thành thẻ (`max-md:`) hoặc cuộn
  ngang có cột tên dính trái

### Kiến Trúc Component (Atomic Design)

Dự án tuân theo **Atomic Design**:

- **Atoms** - Nguyên tố cơ bản: Button, Icon, Alert, Spinner, LoginInput,
  Textarea, Heading, Text, Caption
- **Molecules** - Nhóm atoms: ProductCard, ShiftCard, SearchBar, EmptyState,
  Modal, NotificationBell
- **Organisms** - Phần UI phức tạp: CategorySidebar, CartFab, ProductGrid,
  ReviewModal, analytics charts, manager tabs/modals, lịch ca
- **Templates** - Bố cục trang: MainLayout, StaffLayout, ManagerLayout,
  RoleGuard

Quy ước import, danh sách component theo từng tầng: `components/COMPONENTS.md`.
Mỗi hàm và component có JSDoc, rê chuột vào tên trong editor để xem mô tả và
tham số.

### Data & Integration

- Component chỉ lấy dữ liệu qua `lib/services` hoặc context, không import
  `lib/mock-data`.
- Lỗi API là `ApiError` với `code` (`BR-xx`, `NOT_FOUND`...). Chọn câu thông báo
  theo `code` bằng `lib/utils/errors.ts`.
- Khi backend có endpoint, chỉ thay thân hàm service tương ứng bằng
  `apiRequest(...)`.

### Tài Liệu Chi Tiết

- **app/APP.md** - Routes, layouts, pages
- **components/COMPONENTS.md** - Các tầng component và quy ước import
- **components/atoms/ATOMS.md** - Cách dùng từng atom
- **layouts/LAYOUTS.md** - Header, Footer, responsive
- **lib/LIB.md** - Types, services, mock backend, contexts
- **../docs/** - Đặc tả, business rules, use case, ERD, API, activity, sequence
