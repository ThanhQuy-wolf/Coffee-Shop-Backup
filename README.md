# Coffee Shop Frontend

Dự án Frontend cho hệ thống đặt món cà phê, xây dựng bằng Next.js App Router,
React 19, TypeScript và Tailwind CSS v4.

---

## Mô Tả Dự Án

Giao diện người dùng (frontend) cho hệ thống đặt và bán đồ uống trực tuyến.

### Tính Năng Hiện Tại

#### 1. **Trang Đăng Nhập & Đăng Ký** (`app/(main)/login`, `app/(main)/register`)

- Form đăng nhập với validation (username, password)
- Form đăng ký với xác thực OTP
- Lưu trữ thông tin người dùng trong localStorage
- Hỗ trợ 3 loại tài khoản: Manager, Staff, Customer
- Hiển thị thông tin shop trong form

#### 2. **Trang Khám Phá Quán Nước** (`app/(feed)/feed`)

- Danh sách các quán cà phê
- Tìm kiếm theo tên quán và địa chỉ
- Thẻ quán với ảnh, địa chỉ, nút "Xem menu"
- Responsive layout (grid 1/2/3 cột)
- Empty state khi không tìm thấy quán

#### 3. **Trang Chính - Duyệt Thực Đơn** (`app/(main)`)

Dành cho khách hàng:

- Sidebar collapsible (64px/240px) - danh mục sản phẩm
- Grid sản phẩm responsive (1-5 cột tuỳ thiết bị)
- Tìm kiếm món theo tên / mô tả
- Xem card sản phẩm với giá và nút "Mua"
- Lọc tự động theo trạng thái available
- Mobile menu: scrollable category tabs (< md)

#### 4. **Trang Thanh Toán** (`app/(main)/payment`)

- Bảng danh sách sản phẩm trong giỏ hàng với điều chỉnh số lượng
- Invoice aside sticky với tổng giá và nút thanh toán (Tiền mặt, QR)
- Modal đánh giá 5 sao dành riêng cho khách hàng (ReviewModal)

#### 5. **Hệ Thống Giỏ Hàng** (`lib/cart-context.tsx`)

- Lưu trữ trạng thái giỏ trong localStorage
- Thêm/xóa/tăng/giảm số lượng sản phẩm
- Tính tổng giá và số mặt hàng
- Persist dữ liệu giữa các session

#### 6. **Hệ Thống Xác Thực** (`lib/auth-context.tsx`)

- Quản lý trạng thái người dùng (login/logout/register)
- Lưu thông tin user trong localStorage
- Mock auth database với 3 loại tài khoản
- Hỗ trợ hoàn tất đăng ký qua OTP

#### 7. **Hệ Thống Danh Mục** (`lib/menu-context.tsx`)

- Chia sẻ trạng thái category giữa Header mobile và Sidebar
- Tự động clear search khi thay đổi category

#### 8. **Manager Dashboard** (`app/(manager)/manager`)

Dành cho quản lý:

- Sidebar desktop: Brand, tab navigation (Thực đơn / Combo / Danh mục), link tới Analytics
- CRUD sản phẩm, combo, danh mục qua modals
- Auth guard: tự động redirect non-manager về `/`

#### 9. **Trang Phân Tích Tài Chính** (`app/(manager)/manager/analytics`)

- Summary cards: Doanh thu, đơn hàng, lợi nhuận, giá trị đơn trung bình (so sánh kỳ trước)
- Bộ chọn kỳ: Ngày / Tuần / Tháng / Năm
- Biểu đồ SVG thuần: Line, Bar, Pie — hover tooltips tương tác
- Bảng top 5 sản phẩm và bảng chi tiết có thể sắp xếp
- Lọc theo danh mục

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

### Lint & Format

```bash
pnpm lint
pnpm format
```

### Release

```bash
pnpm release
```

---

## Cấu Trúc Thư Mục

```
frondend/
+-- app/                        # Next.js App Router
|   +-- layout.tsx              # Root layout + Header + Footer
|   +-- globals.css             # CSS design tokens + Tailwind import
|   +-- providers.tsx           # Context providers (Auth, Menu, Cart)
|   +-- APP.md                  # Tài liệu chi tiết về routes
|   +-- (main)/                 # Main route group
|   |   +-- layout.tsx          # Main layout
|   |   +-- page.tsx            # Trang chính - duyệt thực đơn (/)
|   |   +-- login/page.tsx      # Trang đăng nhập (/login)
|   |   +-- register/page.tsx   # Trang đăng ký (/register)
|   |   +-- payment/page.tsx    # Trang thanh toán (/payment)
|   +-- (feed)/                 # Feed route group
|   |   +-- layout.tsx          # Feed layout
|   |   +-- feed/page.tsx       # Trang khám phá quán nước (/feed)
|   +-- (manager)/              # Manager route group
|       +-- layout.tsx          # Manager layout - auth guard + ManagerProvider
|       +-- manager/page.tsx    # Manager Dashboard (/manager)
|       +-- manager/analytics/page.tsx  # Financial Analytics (/manager/analytics)
+-- components/                 # Atomic Design UI components
|   +-- atoms/                  # Nguyên tử: Button, Input, Badge, Text...
|   +-- molecules/              # Phân tử: ProductCard, ShopCard, SearchBar...
|   +-- organisms/              # Tổ chức: CategorySidebar, CartFab, ProductGrid,
|   |                           #          ReviewModal, analytics charts, manager tabs...
|   +-- templates/              # Bố cục trang: MainLayout, AuthLayout,
|   |                           #               FeedLayout, ManagerLayout
|   +-- COMPONENTS.md           # Tài liệu chi tiết components (Atomic Design)
+-- layouts/                    # Layout-level components
|   +-- header.tsx              # Sticky top header + auth info
|   +-- footer.tsx              # Footer + shop info
|   +-- LAYOUTS.md              # Tài liệu chi tiết layouts
+-- lib/                        # Shared logic & data
|   +-- constants.ts            # Mock data (products, shops, users, analytics, shop info)
|   +-- types.ts                # TypeScript interfaces
|   +-- auth-context.tsx        # Authentication context & provider
|   +-- cart-context.tsx        # Shopping cart context & provider
|   +-- menu-context.tsx        # Menu/Category context & provider
|   +-- manager-context.tsx     # Manager CRUD context & provider
|   +-- analytics-utils.ts      # Financial analytics helper utilities
|   +-- LIB.md                  # Tài liệu chi tiết về lib
+-- types/                      # Global TypeScript declarations
|   +-- css.d.ts                # CSS module type shim
+-- public/                     # Static assets
|   +-- imgs/
|   |   +-- logo.png
|   |   +-- products/           # Ảnh sản phẩm
|   +-- favicon/
+-- scripts/                    # Release & CI scripts
|   +-- release.ts
+-- WORKFLOW.md                 # Tài liệu kiến trúc tổng thể & quy trình
+-- README.md                   # (file này) - Mô tả dự án
+-- TODO.md                     # Danh sách tính năng hoàn thành & chưa làm
+-- Atomic.md                   # Hướng dẫn cấu trúc Atomic Design
+-- AGENTS.md                   # Hướng dẫn cho AI agents
+-- next.config.ts
+-- tsconfig.json
+-- postcss.config.mjs
+-- eslint.config.ts
+-- release.config.ts
+-- package.json
+-- pnpm-lock.yaml
+-- pnpm-workspace.yaml
+-- dockerfile
+-- k8s.yaml
```

---

## Công Nghệ Sử Dụng

| Công nghệ    | Phiên bản | Mục đích                              |
| ------------ | --------- | ------------------------------------- |
| Next.js      | 16.1.7    | React Framework (App Router)          |
| React        | 19.2.3    | Thư viện UI                           |
| TypeScript   | ^5        | Kiểu dữ liệu tĩnh                     |
| Tailwind CSS | ^4.2.2    | Utility-first CSS framework           |
| Geist Font   | -         | Font chữ (Google Fonts via next/font) |
| FontAwesome  | 6.7.2     | Icon library (CDN)                    |
| pnpm         | -         | Package manager                       |
| ESLint       | ^9        | Linting                               |
| Prettier     | ^3        | Code formatting                       |
| semantic-release | ^25   | Automated versioning & release        |

---

## Ghi Chú Phát Triển

### Điểm Vào Chính

- **Trang Chủ (User):** `app/(main)/page.tsx` - Duyệt thực đơn
- **Trang Khám Phá:** `app/(feed)/feed/page.tsx` - Khám phá quán
- **Đăng Nhập:** `app/(main)/login/page.tsx`
- **Đăng Ký:** `app/(main)/register/page.tsx`
- **Thanh Toán:** `app/(main)/payment/page.tsx`
- **Manager Dashboard:** `app/(manager)/manager/page.tsx`
- **Phân Tích Tài Chính:** `app/(manager)/manager/analytics/page.tsx`

### Tài Khoản Demo

| Loại tài khoản | Tên đăng nhập  | Mật khẩu       |
| -------------- | -------------- | -------------- |
| Manager        | admin          | admin          |
| Staff          | Nguyễn Văn An  | Nguyễn Văn An  |
| Customer       | 0987654321     | user1          |

### Design & Styling

- Design tokens (CSS variables) định nghĩa trong `app/globals.css`
- Tailwind CSS v4 + custom properties cho consistent color/spacing
- Dark mode: biến CSS đã chuẩn bị sẵn nhưng chưa kích hoạt
- FontAwesome icons từ CDN

### Kiến Trúc Component (Atomic Design)

Dự án tuân theo **Atomic Design** pattern — chi tiết tại `Atomic.md`:

- **Atoms** - Nguyên tố cơ bản: Button, Input, Badge, Text, Heading, Divider
- **Molecules** - Nhóm atoms: ProductCard, ShopCard, SearchBar, PaymentSummaryCard
- **Organisms** - Phần UI phức tạp: CategorySidebar, CartFab, ProductGrid, ShopGrid, ReviewModal, analytics charts, manager tabs/modals
- **Templates** - Bố cục trang: MainLayout, AuthLayout, FeedLayout, ManagerLayout

### Data & Integration

- Mock data nằm trong `lib/constants.ts`
- Context providers trong `app/providers.tsx`: AuthProvider, MenuProvider, CartProvider
- ManagerProvider được thêm bởi `app/(manager)/layout.tsx`
- Thay bằng API calls khi backend sẵn sàng
- Ảnh sản phẩm: thêm vào `public/imgs/products/`

### Tài Liệu Chi Tiết

- **WORKFLOW.md** - Kiến trúc tổng thể, data flow, quy trình phát triển
- **Atomic.md** - Cấu trúc Atomic Design và quy ước component
- **APP.md** - Chi tiết các routes, layouts, pages
- **COMPONENTS.md** - Tài liệu từng component (Atomic Design)
- **LAYOUTS.md** - Header, Footer, responsive behavior
- **LIB.md** - Constants, Types, Contexts
- **AGENTS.md** - Hướng dẫn cho AI agents làm việc với codebase
