# Coffee Shop Frontend

Dự án Frontend cho hệ thống đặt món cà phê, xây dựng bằng Next.js App Router,
React 19, TypeScript và Tailwind CSS v4.

---

## Mô Tả Dự Án

Giao diện người dùng (frontend) cho hệ thống đặt và bán đồ uống trực tuyến.

### Trang Người Dùng (User Page - /)

Dành cho khách hàng:

- Duyệt thực đơn theo danh mục (sidebar collapsible)
- Tìm kiếm món theo tên / mô tả
- Xem card sản phẩm với giá và nút Mua
- Lọc tự động theo trạng thái available

### Trang Quản Lý (Manager Page - chưa triển khai)

Dành cho chủ quán / nhân viên:

- Quản lý thực đơn (thêm, sửa, xóa món)
- Theo dõi và xử lý đơn hàng

---

## Cách Chạy Dự Án

### Yêu cầu hệ thống

- Node.js >= 18
- pnpm (khuyến nghị) hoặc npm

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

### Lint

```bash
pnpm lint
```

---

## Cấu Trúc Thư Mục

```
frondend/
+-- app/                   # Next.js App Router
|   +-- layout.tsx         # Root layout
|   +-- page.tsx           # Trang chủ - sidebar + product grid
|   +-- globals.css        # CSS design tokens + Tailwind import
+-- components/            # Shared UI components
|   +-- Navbar.tsx         # Sidebar danh mục (collapsible)
|   +-- CartProduct.tsx    # Card sản phẩm
|   +-- COMPONENTS.md      # Tài liệu component
+-- layouts/               # Layout-level components
|   +-- header.tsx         # Sticky top header
|   +-- footer.tsx         # Footer
+-- lib/                   # Shared logic & data
|   +-- constants.ts       # Mock data
|   +-- types.ts           # TypeScript interfaces
+-- types/                 # Global TypeScript declarations
|   +-- css.d.ts           # CSS module type shim
+-- public/                # Static assets
+-- WORKFLOW.md            # Tài liệu kiến trúc & quy trình
+-- next.config.ts
+-- tsconfig.json
+-- postcss.config.mjs
+-- eslint.config.mjs
+-- package.json
+-- pnpm-workspace.yaml
```

---

## Công Nghệ Sử Dụng

| Công nghệ    | Phiên bản | Mục đích                              |
| ------------ | --------- | ------------------------------------- |
| Next.js      | 16.1.7    | React Framework (App Router)          |
| React        | 19.2.3    | Thư viện UI                           |
| TypeScript   | ^5        | Kiểu dữ liệu tĩnh                     |
| Tailwind CSS | ^4        | Utility-first CSS framework           |
| Geist Font   | -         | Font chữ (Google Fonts via next/font) |
| FontAwesome  | 6.7.2     | Icon library (CDN)                    |
| pnpm         | -         | Package manager                       |
| ESLint       | ^9        | Linting                               |

---

## Ghi Chú Phát Triển

- Trang chủ (app/page.tsx) là điểm vào chính của User Page
- Design tokens định nghĩa trong app/globals.css dưới dạng CSS custom properties
- Mock data nằm trong lib/constants.ts - thay bằng API calls khi backend sẵn
  sàng
- Dark mode: biến CSS đã chuẩn bị sẵn trong globals.css nhưng chưa kích hoạt
- Ảnh sản phẩm: thêm ảnh thực vào public/imgs/products/
- Xem WORKFLOW.md để hiểu kiến trúc tổng thể và quy trình mở rộng dự án
