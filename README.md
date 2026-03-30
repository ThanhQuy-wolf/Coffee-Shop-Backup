# Coffee Shop Frontend

Dự án Frontend cho hệ thống đặt món cà phê, xây dựng bằng Next.js App Router,
React 19, TypeScript và Tailwind CSS v4.

---

## Mô Tả Dự Án

Giao diện người dùng (frontend) cho hệ thống đặt và bán đồ uống trực tuyến.

### Tính Năng Hiện Tại

#### 1. **Trang Đăng Nhập & Đăng Ký** (app/(main)/login, app/(main)/register)
- Form đăng nhập với validation (username, password)
- Form đăng ký với xác thực OTP
- Lưu trữ thông tin người dùng trong localStorage
- Hỗ trợ 3 loại tài khoản: Manager, Staff, Customer
- Hiển thị thông tin shop trong form

#### 2. **Trang Khám Phá Quán Nước** (app/(feed)/feed)
- Danh sách các quán cà phê
- Tìm kiếm theo tên quán và địa chỉ
- Thẻ quán với ảnh, địa chỉ, nút "Xem menu"
- Responsive layout (grid 1/2/3 cột)
- Empty state khi không tìm thấy quán

#### 3. **Trang Chính - Duyệt Thực Đơn** (app/(main))
Dành cho khách hàng:
- Sidebar collapsible (64px/240px) - danh mục sản phẩm
- Grid sản phẩm responsive (1-5 cột tuỳ thiết bị)
- Tìm kiếm món theo tên / mô tả
- Xem card sản phẩm với giá và nút "Mua"
- Lọc tự động theo trạng thái available
- Mobile menu: scrollable category tabs (< md)

#### 4. **Hệ Thống Giỏ Hàng** (lib/cart-context.tsx)
- Lưu trữ trạng thái giỏ trong localStorage
- Thêm/xóa/tăng/giảm số lượng sản phẩm
- Tính tổng giá và số mặt hàng
- Persist dữ liệu giữa các session

#### 5. **Hệ Thống Xác Thực** (lib/auth-context.tsx)
- Quản lý trạng thái người dùng (login/logout/register)
- Lưu thông tin user trong localStorage
- Mock auth database với 3 loại tài khoản
- Hỗ trợ hoàn tất đăng ký qua OTP

#### 6. **Hệ Thống Danh Mục** (lib/menu-context.tsx)
- Chia sẻ trạng thái category giữa Header mobile và Sidebar
- Tự động clear search khi thay đổi category

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
|   +-- layout.tsx         # Root layout + Header + Footer
|   +-- globals.css        # CSS design tokens + Tailwind import
|   +-- providers.tsx      # Context providers (Auth, Menu, Cart)
|   +-- APP.md             # Tài liệu chi tiết về routes
|   +-- (main)/            # Main route group
|   |   +-- layout.tsx     # Main layout
|   |   +-- page.tsx       # Trang chính - duyệt thực đơn
|   |   +-- login/page.tsx # Trang đăng nhập
|   |   +-- register/page.tsx # Trang đăng ký
|   |   +-- payment/page.tsx # Trang thanh toán
|   +-- (feed)/            # Feed route group
|       +-- layout.tsx     # Feed layout
|       +-- feed/page.tsx  # Trang khám phá quán nước
+-- components/            # Shared UI components
|   +-- Navbar.tsx         # Sidebar danh mục (collapsible)
|   +-- CartProduct.tsx    # Card sản phẩm
|   +-- CartFab.tsx        # FAB - nút giỏ hàng floating
|   +-- COMPONENTS.md      # Tài liệu chi tiết components & contexts
+-- layouts/               # Layout-level components
|   +-- header.tsx         # Sticky top header + auth demo
|   +-- footer.tsx         # Footer + shop info
|   +-- LAYOUTS.md         # Tài liệu chi tiết layouts
+-- lib/                   # Shared logic & data
|   +-- constants.ts       # Mock data (products, shops, users, shop info)
|   +-- types.ts           # TypeScript interfaces
|   +-- auth-context.tsx   # Authentication context & provider
|   +-- cart-context.tsx   # Shopping cart context & provider
|   +-- menu-context.tsx   # Menu/Category context & provider
|   +-- LIB.md             # Tài liệu chi tiết về lib
+-- types/                 # Global TypeScript declarations
|   +-- css.d.ts           # CSS module type shim
+-- public/                # Static assets
|   +-- imgs/
|   |   +-- logo.png
|   |   +-- products/      # Ảnh sản phẩm
|   +-- favicon/
+-- WORKFLOW.md            # Tài liệu kiến trúc tổng thể & quy trình
+-- README.md              # (file này) - Mô tả dự án
+-- TODO.md                # Danh sách tính năng hoàn thành & chưa làm
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

### Điểm Vào Chính
- **Trang Chủ (User):** `app/(main)/page.tsx` - Duyệt thực đơn
- **Trang Khám Phá:** `app/(feed)/feed/page.tsx` - Khám phá quán
- **Đăng Nhập:** `app/(main)/login/page.tsx`
- **Đăng Ký:** `app/(main)/register/page.tsx`

### Design & Styling
- Design tokens (CSS variables) định nghĩa trong `app/globals.css`
- Tailwind CSS v4 + custom properties cho consistent color/spacing
- Dark mode: biến CSS đã chuẩn bị sẵn nhưng chưa kích hoạt
- FontAwesome icons từ CDN

### Data & Integration
- Mock data nằm trong `lib/constants.ts`
- Context providers trong `app/providers.tsx` - Sử dụng: AuthProvider, MenuProvider, CartProvider
- Thay bằng API calls khi backend sẵn sàng
- Ảnh sản phẩm: thêm vào `public/imgs/products/`

### Tài Liệu Chi Tiết
- **WORKFLOW.md** - Kiến trúc tổng thể, data flow, quy trình phát triển
- **APP.md** - Chi tiết các routes, layouts, pages
- **COMPONENTS.md** - Tài liệu từng component + contexts
- **LAYOUTS.md** - Header, Footer, responsive behavior
- **LIB.md** - Constants, Types, Contexts
