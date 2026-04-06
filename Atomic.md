# ATOMIC DESIGN STRUCTURE GUIDE

## Overview

Project sử dụng **Atomic Design Pattern** để tổ chức UI components theo 5 cấp
độ:

1. **Atoms** - Khối xây dựng cơ bản, không thể chia nhỏ hơn
2. **Molecules** - Nhóm atoms đơn giản hoạt động cùng nhau
3. **Organisms** - Khu vực UI phức tạp, riêng biệt
4. **Templates** - Bố cục cấp trang, cấu trúc nội dung
5. **Pages** - Các phiên bản cụ thể với dữ liệu thật

---

## 1) ATOMS (`components/atoms/`)

**Mục đích:** Khối xây dựng cơ bản, tái sử dụng cao, không phụ thuộc logic phức
tạp.

Không có context/hooks logic phức tạp, chỉ nhận props từ parent.

### Cấu trúc thư mục

```
components/atoms/
├── buttons/
│   ├── Button.tsx           # Nút cơ bản (primary, secondary, danger)
│   ├── IconButton.tsx       # Nút chỉ có icon
│   └── Button.types.ts      # Props types
├── inputs/
│   ├── TextInput.tsx        # Text input cơ bản
│   ├── NumberInput.tsx      # Number input với up/down
│   ├── Checkbox.tsx         # Checkbox
│   └── Input.types.ts       # Props types
├── badges/
│   ├── Badge.tsx            # Badge cơ bản (color variants)
│   ├── PriceBadge.tsx       # Badge hiển thị giá
│   └── Badge.types.ts       # Props types
├── icons/
│   ├── StarIcon.tsx         # Rating star icon
│   ├── CartIcon.tsx         # Shopping cart icon
│   ├── SearchIcon.tsx       # Search icon
│   └── icons.types.ts       # Props types
├── typography/
│   ├── Heading.tsx          # h1-h6 headings
│   ├── Text.tsx             # Body text variants
│   ├── Caption.tsx          # Small caption text
│   └── Typography.types.ts  # Props types
├── dividers/
│   ├── Divider.tsx          # Horizontal divider
│   └── Divider.types.ts     # Props types
├── loaders/
│   ├── Spinner.tsx          # Loading spinner
│   ├── Skeleton.tsx         # Skeleton loader
│   └── Loader.types.ts      # Props types
└── index.ts                 # Barrel export
```

### Ví dụ Atoms

**Button.tsx:**

```tsx
import { ButtonHTMLAttributes } from "react";

import type { ButtonProps } from "./Button.types";

export default function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-semibold rounded-lg transition-colors disabled:opacity-50";
  const variants = {
    primary:
      "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-dark)]",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Button.types.ts:**

```tsx
import { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

---

## 2) MOLECULES (`components/molecules/`)

**Mục đích:** Nhóm atoms tạo thành những UI unit nhỏ, tái sử dụng, có logic đơn
giản.

Có thể sử dụng `useState`, nhưng logic chủ yếu nằm ở parent component.

### Cấu trúc thư mục

```
components/molecules/
├── form-groups/
│   ├── FormField.tsx        # Input + label + error message
│   ├── FormGroup.tsx        # Label + input wrapper
│   └── FormGroup.types.ts   # Props types
├── cards/
│   ├── ProductCard.tsx      # Card hiển thị sản phẩm (image + name + price + btn)
│   ├── ShopCard.tsx         # Card hiển thị quán
│   ├── ReviewCard.tsx       # Card hiển thị review
│   └── Card.types.ts        # Props types
├── ratings/
│   ├── RatingStars.tsx      # Hiển thị 5 sao rating
│   ├── RatingInput.tsx      # Input 5 sao (interactive)
│   └── Rating.types.ts      # Props types
├── price-display/
│   ├── PriceTag.tsx         # Hiển thị giá formatted
│   ├── PriceRange.tsx       # Hiển thị range giá
│   └── Price.types.ts       # Props types
├── search-bar/
│   ├── SearchInput.tsx      # Search input với icon
│   ├── SearchBar.tsx        # Search bar wrapper
│   └── Search.types.ts      # Props types
├── breadcrumb/
│   ├── Breadcrumb.tsx       # Breadcrumb navigation
│   └── Breadcrumb.types.ts  # Props types
├── tabs/
│   ├── TabGroup.tsx         # Tabs wrapper
│   ├── Tab.tsx              # Individual tab
│   └── Tabs.types.ts        # Props types
└── index.ts                 # Barrel export
```

### Ví dụ Molecules

**ProductCard.tsx:**

```tsx
import Button from "@/components/atoms/buttons/Button";
import Text from "@/components/atoms/typography/Text";
import Image from "next/image";

import type { ProductCardProps } from "./Card.types";

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-card)] p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative mb-3 h-48 w-full overflow-hidden rounded-md">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <Text variant="body1" className="font-semibold">
        {product.name}
      </Text>
      <Text
        variant="caption"
        className="text-[color:var(--color-text-secondary)]"
      >
        {product.description}
      </Text>
      <div className="mt-3 flex items-center justify-between">
        <Text
          variant="body2"
          className="font-bold text-[color:var(--color-primary)]"
        >
          ${product.price.toFixed(2)}
        </Text>
        <Button size="sm" onClick={() => onAddToCart(product)}>
          Add
        </Button>
      </div>
    </div>
  );
}
```

---

## 3) ORGANISMS (`components/organisms/`)

**Mục đích:** Khu vực UI phức tạp, độc lập, có logic riêng.

Kết hợp multiple molecules/atoms, có thể sử dụng contexts (useAuth, useCart,
etc.), state phức tạp.

### Cấu trúc thư mục

```
components/organisms/
├── navigation/
│   ├── Navbar.tsx           # Sidebar category filter (cũ CartProduct)
│   ├── CategoryMenu.tsx     # Category menu wrapper
│   └── Navigation.types.ts  # Props types
├── cart/
│   ├── CartFab.tsx          # Floating action button giỏ hàng
│   ├── CartSummary.tsx      # Cart summary widget
│   ├── CartList.tsx         # Danh sách sản phẩm trong giỏ
│   └── Cart.types.ts        # Props types
├── product-grid/
│   ├── ProductGrid.tsx      # Grid hiển thị danh sách sản phẩm
│   ├── ProductFilters.tsx   # Bộ lọc sản phẩm (category, price, rating)
│   └── ProductGrid.types.ts # Props types
├── forms/
│   ├── LoginForm.tsx        # Form đăng nhập (username + password + submit)
│   ├── RegisterForm.tsx     # Form đăng ký
│   ├── CheckoutForm.tsx     # Form thanh toán
│   ├── ReviewForm.tsx       # Form đánh giá (modal content)
│   └── Forms.types.ts       # Props types
├── modals/
│   ├── ReviewModal.tsx      # Modal đánh giá (header + form + footer)
│   ├── ConfirmModal.tsx     # Modal xác nhận generic
│   └── Modal.types.ts       # Props types
├── shop-grid/
│   ├── ShopGrid.tsx         # Grid hiển thị danh sách quán
│   ├── ShopFilters.tsx      # Bộ lọc quán (location, rating)
│   └── ShopGrid.types.ts    # Props types
├── hero-section/
│   ├── HeroSection.tsx      # Banner hero cấp trang
│   └── Hero.types.ts        # Props types
├── featured-section/
│   ├── FeaturedProducts.tsx # Section sản phẩm nổi bật
│   ├── FeaturedShops.tsx    # Section quán nổi bật
│   └── Featured.types.ts    # Props types
└── index.ts                 # Barrel export
```

### Ví dụ Organisms

**ProductGrid.tsx:**

```tsx
"use client";

import ProductCard from "@/components/molecules/cards/ProductCard";
import { useCart } from "@/lib/cart-context";
import { MOCK_PRODUCTS } from "@/lib/constants";
import { useMenu } from "@/lib/menu-context";

import type { ProductGridProps } from "./ProductGrid.types";

export default function ProductGrid({ searchQuery = "" }: ProductGridProps) {
  const { activeCategory } = useMenu();
  const { addToCart } = useCart();

  const filtered = MOCK_PRODUCTS.filter((product) => {
    const matchCategory =
      activeCategory === "all" || product.category === activeCategory;
    const matchSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {filtered.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={addToCart}
        />
      ))}
    </div>
  );
}
```

---

## 4) TEMPLATES (`components/templates/`)

**Mục đích:** Bố cục cấp trang, cấu trúc nội dung, không có data cụ thể.

Chứa layout và structure của page, nhưng data được truyền từ page component.

### Cấu trúc thư mục

```
components/templates/
├── main-layout/
│   ├── MainLayout.tsx       # Layout chính (header + sidebar + content + footer)
│   ├── MainLayout.types.ts  # Props types
│   └── styles.ts            # Responsive grid layout logic
├── feed-layout/
│   ├── FeedLayout.tsx       # Layout feed (khám phá quán)
│   └── FeedLayout.types.ts  # Props types
├── manager-layout/
│   ├── ManagerLayout.tsx    # Layout manager dashboard
│   └── ManagerLayout.types.ts # Props types
├── checkout-layout/
│   ├── CheckoutLayout.tsx   # Layout thanh toán (steps, cart, form)
│   └── CheckoutLayout.types.ts # Props types
├── auth-layout/
│   ├── AuthLayout.tsx       # Layout auth (login/register)
│   └── AuthLayout.types.ts  # Props types
└── index.ts                 # Barrel export
```

### Ví dụ Templates

**MainLayout.tsx:**

```tsx
import Navbar from "@/components/organisms/navigation/Navbar";
import Footer from "@/layouts/footer";
import Header from "@/layouts/header";

import type { MainLayoutProps } from "./MainLayout.types";

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar - ẩn trên mobile */}
        <nav className="hidden w-64 border-r border-[color:var(--color-border)] bg-[color:var(--color-bg-sidebar)] md:block">
          <Navbar />
        </nav>
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
```

---

## 5) PAGES (`app/*/page.tsx`)

**Mục đích:** Các phiên bản cụ thể với dữ liệu thật, logic cấp trang.

Server/client components sử dụng templates, organisms, nhận data từ API/context.

### Ví dụ Pages

**app/(main)/page.tsx:**

```tsx
"use client";

import FeaturedSection from "@/components/organisms/featured-section/FeaturedSection";
import ProductGrid from "@/components/organisms/product-grid/ProductGrid";
import MainLayout from "@/components/templates/main-layout/MainLayout";
import { useState } from "react";

export default function MainPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <MainLayout>
      <FeaturedSection />
      <div className="mt-8">
        <ProductGrid searchQuery={searchQuery} />
      </div>
    </MainLayout>
  );
}
```

---

## 6) File Hierarchy Summary

```
components/
├── atoms/
│   ├── buttons/
│   ├── inputs/
│   ├── badges/
│   ├── icons/
│   ├── typography/
│   ├── dividers/
│   ├── loaders/
│   └── index.ts
├── molecules/
│   ├── form-groups/
│   ├── cards/
│   ├── ratings/
│   ├── price-display/
│   ├── search-bar/
│   ├── breadcrumb/
│   ├── tabs/
│   └── index.ts
├── organisms/
│   ├── navigation/
│   ├── cart/
│   ├── product-grid/
│   ├── forms/
│   ├── modals/
│   ├── shop-grid/
│   ├── hero-section/
│   ├── featured-section/
│   └── index.ts
├── templates/
│   ├── main-layout/
│   ├── feed-layout/
│   ├── manager-layout/
│   ├── checkout-layout/
│   ├── auth-layout/
│   └── index.ts
└── ATOMIC_DESIGN.md (this file)
```

---

## 7) Migration Guide (Old → New)

### Old Structure → New Structure Mapping

| Old File          | New Location                       | Type     |
| ----------------- | ---------------------------------- | -------- |
| `CartProduct.tsx` | `molecules/cards/ProductCard.tsx`  | Molecule |
| `Navbar.tsx`      | `organisms/navigation/Navbar.tsx`  | Organism |
| `CartFab.tsx`     | `organisms/cart/CartFab.tsx`       | Organism |
| `ReviewModal.tsx` | `organisms/modals/ReviewModal.tsx` | Organism |

### Migration Steps

1. Create new directory structure under `components/`
2. Move existing components to appropriate levels (atoms → molecules →
   organisms)
3. Extract shared styles/logic into atoms
4. Update imports in `app/` pages
5. Test responsiveness at each breakpoint
6. Update `COMPONENTS.md` with new structure

---

## 8) Best Practices

### Atoms Development

- ✅ Reusable across entire project
- ✅ No business logic
- ✅ No context/hooks (useAuth, useCart)
- ✅ Pure props-based
- ✅ Full TypeScript typing
- ❌ No "use client" needed (unless interactive, e.g., Button)

### Molecules Development

- ✅ Combines multiple atoms
- ✅ Simple state (open/close, hover state)
- ✅ No complex business logic
- ✅ Can use useState for UI state
- ✅ Reusable in multiple contexts
- ❌ No global state (useAuth, useCart)

### Organisms Development

- ✅ Complex UI sections
- ✅ Can use contexts (useAuth, useCart, useMenu)
- ✅ Business logic
- ✅ Always "use client"
- ✅ Filter, sort, complex interactions
- ❌ Not reusable across different page types

### Templates Development

- ✅ Page layout structure
- ✅ Composition of organisms + layout
- ✅ No data fetching/business logic
- ✅ Children prop pattern
- ✅ Props for customization
- ❌ No hardcoded data

### Pages Development

- ✅ Specific page implementations
- ✅ Route-specific logic
- ✅ Data integration
- ✅ Context usage at page level
- ✅ State management orchestration
- ❌ No UI component definitions (use organisms)

---

## 9) Import Patterns

### Atoms

```tsx
import Button from "@/components/atoms/buttons/Button";
import Text from "@/components/atoms/typography/Text";
```

### Molecules

```tsx
import ProductCard from "@/components/molecules/cards/ProductCard";
import FormField from "@/components/molecules/form-groups/FormField";
```

### Organisms

```tsx
import LoginForm from "@/components/organisms/forms/LoginForm";
import ProductGrid from "@/components/organisms/product-grid/ProductGrid";
```

### Templates

```tsx
import MainLayout from "@/components/templates/main-layout/MainLayout";
```

### Barrel Exports

```tsx
// Usage
import { Button, Text } from "@/components/atoms";

// components/atoms/index.ts
export { default as Button } from "./buttons/Button";
export { default as Text } from "./typography/Text";
export * from "./buttons/Button.types";
```

---

## 10) Common Patterns

### Creating a New Atom

```tsx
// atoms/buttons/NewButton.tsx
export default function NewButton({ variant, ...props }: Props) {
  return <button className={styles[variant]} {...props} />;
}

// atoms/buttons/NewButton.types.ts
export interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "type1" | "type2";
}
```

### Creating a New Molecule

```tsx
// molecules/cards/NewCard.tsx
export default function NewCard({ item, onAction }: Props) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)}>{/* atoms composition */}</div>
  );
}
```

### Creating a New Organism

```tsx
// organisms/sections/NewSection.tsx
"use client";

import ProductCard from "@/components/molecules/cards/ProductCard";
import { useAuth } from "@/lib/auth-context";

export default function NewSection() {
  const { user } = useAuth();
  // business logic, filtering, etc.
  return <section>{/* molecules composition + logic */}</section>;
}
```

### Creating a New Template

```tsx
// templates/layouts/NewTemplate.tsx
export default function NewTemplate({ children, header }: Props) {
  return (
    <div className="layout">
      <header>{header}</header>
      <main>{children}</main>
    </div>
  );
}
```

---

## 11) Testing & Documentation

### For Each Component Level

#### Atoms

- Unit test: Props validation, styling
- Storybook: All variants, all states
- Doc: Props interface, usage examples

#### Molecules

- Integration test: Atoms composition
- Storybook: Different molecule states
- Doc: Props, behavior, dependencies

#### Organisms

- Integration test: With contexts mocked
- E2E: User interactions
- Doc: Logic flow, API integration points

#### Templates

- Layout test: Responsive grid layouts
- Visual: Desktop/tablet/mobile
- Doc: Layout structure, breakpoints

#### Pages

- E2E test: Full user flows
- Performance: Metrics
- Doc: Route, data flow, features

---

## 12) Performance Optimization

### Code Splitting

- Atoms: Always bundled (small, frequently used)
- Molecules: Bundled by page/feature
- Organisms: Use `dynamic()` for heavy sections
- Templates: Bundled by layout type
- Pages: Automatic splitting by Next.js

### Lazy Loading Example

```tsx
import dynamic from "next/dynamic";

const ReviewModal = dynamic(
  () => import("@/components/organisms/modals/ReviewModal"),
  { loading: () => <Spinner /> },
);
```

### Image Optimization

- Use Next.js `Image` component (atoms/molecules)
- Optimize with `priority` for above-fold
- Use responsive sizes: `sizes="(max-width: 640px) 100vw, 50vw"`

---

## 13) Accessibility

### All Levels

- Semantic HTML: `<button>`, `<a>`, `<form>`, `<nav>`
- ARIA attributes: `aria-label`, `aria-expanded`, `role`
- Keyboard navigation: Tab order, focus visible
- Color contrast: WCAG AA minimum
- Alt text: All images have meaningful `alt`

### Example

```tsx
<button
  aria-label="Add to cart"
  className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  <CartIcon aria-hidden="true" />
  Add to Cart
</button>
```

---

## 14) Version Control & Documentation

### File Format

```
components/
├── atoms/
│   ├── buttons/
│   │   ├── Button.tsx
│   │   ├── Button.types.ts
│   │   └── Button.md  # Component documentation
│   └── ...
├── molecules/
│   ├── cards/
│   │   ├── ProductCard.tsx
│   │   ├── Card.types.ts
│   │   └── ProductCard.md
│   └── ...
└── ...
```

### Documentation Template

```markdown
# ProductCard

## Purpose

Display individual product with image, name, price, and action button.

## Props

- `product: Product` - Product data
- `onAddToCart: (product: Product) => void` - Add to cart handler

## Usage

\`\`\`tsx <ProductCard product={item} onAddToCart={addToCart} /> \`\`\`

## Variants

- Image with loading state
- With discount badge
- With rating stars

## Responsive

- Mobile: Single column, full width
- Desktop: Grid layout
```

---

Cấu trúc này cung cấp: ✅ **Scalability**: Dễ thêm components mới ✅
**Reusability**: Tối đa tái sử dụng ✅ **Maintainability**: Code dễ hiểu, tìm
kiếm ✅ **Testability**: Mỗi level có logic riêng ✅ **Performance**: Smart
code-splitting
