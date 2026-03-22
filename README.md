# Hệ Thống Bán Đồ Ăn - Frontend

Dự án Frontend cho một Hệ thống bán đồ ăn (Food Ordering System), được xây dựng bằng Next.js và React, với giao diện hiện đại sử dụng Tailwind CSS.

---

## Mô Tả Dự Án

Đây là giao diện người dùng (frontend) cho hệ thống đặt và bán đồ ăn trực tuyến. Hệ thống gồm 2 trang chính:

### Trang Người Dùng (User Page)
Dành cho khách hàng với các chức năng:
- Chọn món ăn: Duyệt và thêm món vào giỏ hàng
- Xem hóa đơn: Xem chi tiết các món đã chọn và tổng tiền
- Thanh toán: Thực hiện thanh toán đơn hàng
- Đánh giá: Đánh giá chất lượng món ăn và dịch vụ

### Trang Quản Lý (Manager Page)
Dành cho chủ quán / nhân viên quản lý với các chức năng:
- Quản lý thực đơn (thêm, sửa, xóa món ăn)
- Theo dõi và xử lý đơn hàng
- Quản lý thông tin quán

---

## Cách Chạy Dự Án

### Yêu cầu hệ thống
- Node.js >= 18
- pnpm (khuyến nghị) hoặc npm / yarn / bun

### Cài đặt dependencies

```bash
pnpm install
# hoặc
npm install
```

### Chạy môi trường phát triển

```bash
pnpm dev
# hoặc
npm run dev
```

Mở trình duyệt tại http://localhost:3000 để xem kết quả.

### Build production

```bash
pnpm build
pnpm start
```

---

## Cấu Trúc Thư Mục

Dự án sử dụng cấu trúc mặc định của Next.js App Router:

```
frondend/
├── app/                        # App Router (Next.js)
│   ├── layout.tsx              # Root layout (font, metadata, global styles)
│   ├── page.tsx                # Trang chủ (User Page)
│   ├── globals.css             # CSS toàn cục (Tailwind import)
│   ├── favicon.ico             # Icon trang web
│   └── components/             # Components dùng riêng trong app/
├── components/                 # Shared components dùng chung toàn dự án
│   └── CartProduct.tsx         # Component card sản phẩm trong giỏ hàng
├── public/                     # Static assets (ảnh, svg, ...)
├── next.config.ts              # Cấu hình Next.js
├── tsconfig.json               # Cấu hình TypeScript
├── postcss.config.mjs          # Cấu hình PostCSS (Tailwind)
├── eslint.config.mjs           # Cấu hình ESLint
├── package.json                # Dependencies và scripts
└── pnpm-workspace.yaml         # Cấu hình pnpm workspace
```

---

## Công Nghệ Sử Dụng

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Next.js | 16.1.7 | React Framework (App Router) |
| React | 19.2.3 | Thư viện UI |
| TypeScript | ^5 | Kiểu dữ liệu tĩnh |
| Tailwind CSS | ^4 | Utility-first CSS framework |
| SCSS | - | CSS preprocessor |
| Geist Font | - | Font chữ mặc định (Google Fonts) |
| pnpm | - | Package manager |
| ESLint | ^9 | Linting code |


---

## Ghi Chú Phát Triển

- Trang chủ () là điểm vào chính của **User Page**
- Chỉnh sửa  để thay đổi giao diện trang chủ; trang tự động cập nhật khi lưu file
- Styles toàn cục được định nghĩa trong 
- Tailwind CSS v4 được import trực tiếp qua  trong CSS
- Hỗ trợ **Dark Mode** tự động theo cài đặt hệ thống ()
- Font chữ sử dụng **Geist Sans** và **Geist Mono** từ Google Fonts thông qua 
