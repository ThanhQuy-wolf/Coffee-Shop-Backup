# AGENTS GUIDE (Updated with Atomic Design)

## 1) Kiến trúc project

Dự án sử dụng **Next.js App Router** với **Atomic Design Pattern** cho UI
components.

### `app/` - Routes & Pages

Chứa route/page/layout theo Next.js App Router.

- **`layout.tsx`** - Root layout toàn app (Header + Providers + Footer wrapper)
- **`providers.tsx`** - Client component gắn 3 providers: AuthProvider,
  MenuProvider, CartProvider
- **`globals.css`** - Global styles + CSS variables + Tailwind imports
- **Route groups:**
  - **`(main)/`** - Main shopping interface (duyệt menu, đăng nhập, đăng ký,
    thanh toán)
  - **`(feed)/`** - Feed/discovery page (khám phá quán)
  - **`(manager)/`** - Manager dashboard (quản lý sản phẩm, đơn hàng) - **[ĐANG
    PHÁT TRIỂN]**
- **Tài liệu:** `app/APP.md` - Chi tiết routes, pages, CSS tokens

### `components/` - Reusable UI Components (Atomic Design)

Chứa UI components được tổ chức theo **Atomic Design Pattern** với 5 cấp độ:

#### **ATOMS** (`components/atoms/`)

**Khối xây dựng cơ bản, không chia nhỏ hơn được.**

Các component cơ bản, tái sử dụng cao, không logic phức tạp:

- **`buttons/`** - Button, IconButton
- **`inputs/`** - TextInput, NumberInput, Checkbox
- **`badges/`** - Badge, PriceBadge, StatusBadge
- **`icons/`** - StarIcon, CartIcon, SearchIcon, etc.
- **`typography/`** - Heading, Text, Caption
- **`dividers/`** - Divider
- **`loaders/`** - Spinner, Skeleton

**Đặc điểm:**

- ✅ Pure props-based, no logic
- ✅ Full TypeScript typing
- ✅ Reusable across entire project
- ✅ No context/hooks
- 📄 Tài liệu: `components/atoms/ATOMS.md`

#### **MOLECULES** (`components/molecules/`)

**Nhóm atoms đơn giản hoạt động cùng nhau.**

Kết hợp multiple atoms, có thể có state đơn giản (open/close):

- **`form-groups/`** - FormField (input + label + error)
- **`cards/`** - ProductCard, ShopCard, ReviewCard
- **`ratings/`** - RatingStars, RatingInput
- **`price-display/`** - PriceTag, PriceRange
- **`search-bar/`** - SearchInput, SearchBar
- **`breadcrumb/`** - Breadcrumb
- **`tabs/`** - TabGroup, Tab

**Đặc điểm:**

- ✅ Combines atoms
- ✅ Simple state (useState for UI)
- ✅ No business logic
- ✅ Reusable in multiple contexts
- ❌ No global context (useAuth, useCart)
- 📄 Tài liệu: `components/molecules/MOLECULES.md`

#### **ORGANISMS** (`components/organisms/`)

**Khu vực UI phức tạp, riêng biệt, có logic riêng.**

Sections phức tạp kết hợp molecules + atoms, có logic, data filtering:

- **`navigation/`** - Navbar, CategoryMenu
- **`cart/`** - CartFab, CartSummary, CartList
- **`product-grid/`** - ProductGrid, ProductFilters
- **`forms/`** - LoginForm, RegisterForm, CheckoutForm, ReviewForm
- **`modals/`** - ReviewModal, ConfirmModal
- **`shop-grid/`** - ShopGrid, ShopFilters
- **`hero-section/`** - HeroSection
- **`featured-section/`** - FeaturedProducts, FeaturedShops

**Đặc điểm:**

- ✅ Complex UI sections
- ✅ Can use contexts (useAuth, useCart, useMenu)
- ✅ Business logic (filtering, sorting)
- ✅ Always "use client"
- ❌ Not directly reusable (section-specific)
- 📄 Tài liệu: `components/organisms/ORGANISMS.md`

#### **TEMPLATES** (`components/templates/`)

**Bố cục cấp trang, cấu trúc nội dung.**

Page layouts, không có data cụ thể, children composition:

- **`main-layout/`** - MainLayout (header + sidebar + content + footer)
- **`feed-layout/`** - FeedLayout
- **`manager-layout/`** - ManagerLayout
- **`checkout-layout/`** - CheckoutLayout
- **`auth-layout/`** - AuthLayout

**Đặc điểm:**

- ✅ Page-level layout structure
- ✅ Composition of organisms
- ✅ No data fetching
- ✅ Children prop pattern
- ❌ No hardcoded data
- 📄 Tài liệu: `components/templates/TEMPLATES.md`

#### **PAGES** (`app/*/page.tsx`)

**Phiên bản cụ thể với dữ liệu thật.**

Route-specific pages, sử dụng templates + organisms:

- **`app/(main)/page.tsx`** - Main shopping page
- **`app/(main)/checkout/page.tsx`** - Checkout page
- **`app/(feed)/page.tsx`** - Feed/discovery page
- **`app/(manager)/products/page.tsx`** - Manager dashboard

**Đặc điểm:**

- ✅ Route-specific logic
- ✅ Data integration
- ✅ Context usage
- ✅ State orchestration
- ❌ No UI component definitions

**Tài liệu chi tiết:**

- `components/ATOMIC_DESIGN.md` - Full Atomic Design structure guide
- `components/atoms/ATOMS.md` - Atoms inventory & props
- `components/molecules/MOLECULES.md` - Molecules inventory & usage
- `components/organisms/ORGANISMS.md` - Organisms inventory & logic
- `components/templates/TEMPLATES.md` - Templates structure

### `layouts/` - Layout Components

Chứa layout cấp root (không phải Atomic Design templates):

- **`header.tsx`** - Sticky top bar với brand (logo + shop name) + auth status
- **`footer.tsx`** - Footer với 3 sections: brand info, social links, WiFi card
- **Tài liệu:** `layouts/LAYOUTS.md` - Responsive design, CSS variables

### `lib/` - Shared Logic & Data

Chứa logic dùng chung, context, constants, types:

- **`types.ts`** - TypeScript interfaces: User, Product, MenuCategory, Shop,
  ShopInfo
- **`constants.ts`** - Mock data: MOCK_PRODUCTS (18 items), MOCK_SHOPS (5),
  MOCK_USERS, MENU_CATEGORIES (8), SHOP_INFO, SOCIAL_LINKS
- **`auth-context.tsx`** - AuthProvider + useAuth() hook (login, logout,
  register)
- **`cart-context.tsx`** - CartProvider + useCart() hook (add, remove, quantity
  operations)
- **`menu-context.tsx`** - MenuProvider + useMenu() hook (category state)
- **Tài liệu:** `lib/LIB.md` - Chi tiết types, constants, contexts

### `public/` - Static Assets

Chứa static assets:

- **`favicon/`** - Favicon files
- **`imgs/`** - Logo, product images (organized in `products/` subfolder)

### `scripts/` - Internal Scripts

Chứa script nội bộ:

- **`release.ts`** - Semantic release script

### `types/` - Global Types

Chứa type dùng chung cấp project:

- **`css.d.ts`** - TypeScript declarations cho CSS modules

### Root Config Files

- **`package.json`** - Dependencies (Next.js 16.1.7, React 19.2.3, Tailwind
  4.2.2, TypeScript)
- **`tsconfig.json`** - TypeScript config
- **`next.config.ts`** - Next.js config
- **`tailwind.config.ts`** - Tailwind CSS config (v4)
- **`postcss.config.mjs`** - PostCSS config
- **`eslint.config.ts`** - ESLint rules
- **`.prettierrc`** - Prettier formatting
- **`release.config.ts`** - Semantic release config

---

## 2) Code convention (Naming, format, style guide)

### Naming & File Organization

- **React components:** `PascalCase` (e.g., `Button.tsx`, `ProductCard.tsx`)
- **Context/util files:** `kebab-case` (e.g., `auth-context.tsx`,
  `menu-context.tsx`)
- **Type files:** `ComponentName.types.ts` (e.g., `Button.types.ts`)
- **Variables/functions:** `camelCase`
- **Types/Interfaces:** `PascalCase`
- **Routes:** Follow folder structure in `app/` (URL = folder path)
- **Imports:** Use absolute paths with `@/` alias (e.g.,
  `import { Button } from "@/components/atoms/buttons/Button"`)

### Atomic Design File Structure

```
components/
├── atoms/
│   ├── buttons/
│   │   ├── Button.tsx
│   │   └── Button.types.ts
│   ├── typography/
│   │   ├── Text.tsx
│   │   └── Text.types.ts
│   └── index.ts (barrel export)
├── molecules/
│   ├── cards/
│   │   ├── ProductCard.tsx
│   │   └── Card.types.ts
│   └── index.ts
├── organisms/
│   ├── product-grid/
│   │   ├── ProductGrid.tsx
│   │   └── ProductGrid.types.ts
│   └── index.ts
├── templates/
│   ├── main-layout/
│   │   ├── MainLayout.tsx
│   │   └── MainLayout.types.ts
│   └── index.ts
└── ATOMIC_DESIGN.md
```

### Format & Linting

- **Language:** TypeScript (.ts, .tsx) for all files
- **Formatter:** Prettier (config: `.prettierrc`)
  - Import sorting: `@trivago/prettier-plugin-sort-imports`
  - Tailwind class sorting: `prettier-plugin-tailwindcss`
- **Linter:** ESLint (config: `eslint.config.ts`, extends `next` rules)
- **Code style:**
  - Clear, self-documenting code
  - Separate concerns by module/file
  - Avoid code duplication
  - Keep imports clean (no dead code)
  - Use `"use client"` only where needed (interactive components)

### Styling & UI

- **Framework:** Tailwind CSS v4.2.2
- **CSS Variables:** Defined in `globals.css` at `:root`
  - Colors: `--color-primary`, `--color-primary-dark`, `--color-accent`,
    `--color-bg-*`, `--color-text-*`, `--color-border-*`, `--color-shadow-*`
  - Spacing: `--spacing-header-height` (72px)
  - Use in Tailwind: `bg-[color:var(--color-primary)]`,
    `text-[color:var(--color-text-primary)]`
- **Icons:** FontAwesome (free CDN icons via `<i class="fa-solid fa-...">`)
- **Images:** Next.js `Image` component from `next/image`
- **Dark mode:** CSS variables support dark mode (can override `:root` values in
  `@media (prefers-color-scheme: dark)`)

### Responsive Design

- **Breakpoints (Tailwind):** sm (640px), md (768px), lg (1024px), xl (1280px),
  2xl (1536px)
- **Every new UI feature must be responsive:**
  - Mobile (<640px): Single column, stacked layout, collapsed sidebar
  - Tablet (640px-1024px): 2-column layout, adjusted grid
  - Desktop (1024px+): Multi-column, expanded sidebar, comfortable spacing
- **Mobile-first approach:** Write base styles for mobile, then add `sm:`,
  `md:`, `lg:`, `xl:` prefixes for larger screens
- **Example:** `className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4"`

---

## 3) Quy tắc quan trọng

### Markdown Documentation Updates

**Luôn update các file markdown trong folder liên quan khi hoàn thành task:**

| Folder Modified         | Update File                         | Content to Add/Update                       |
| ----------------------- | ----------------------------------- | ------------------------------------------- |
| `components/atoms/`     | `components/atoms/ATOMS.md`         | Atom props, variants, usage examples        |
| `components/molecules/` | `components/molecules/MOLECULES.md` | Molecule props, composition, usage          |
| `components/organisms/` | `components/organisms/ORGANISMS.md` | Organism logic, contexts used, features     |
| `components/templates/` | `components/templates/TEMPLATES.md` | Template structure, responsive layout       |
| `app/`                  | `app/APP.md`                        | Routes, pages, CSS tokens                   |
| `layouts/`              | `layouts/LAYOUTS.md`                | Layout structure, responsive patterns       |
| `lib/`                  | `lib/LIB.md`                        | New types, constants, contexts              |
| **Root**                | `ATOMIC_DESIGN.md`                  | Overall structure, patterns, best practices |

**Quy trình:**

1. Hoàn thành task/feature
2. Update file `.md` tương ứng trong folder
3. Commit code + markdown updates cùng lúc
4. Push to branch

### Type Safety & Data Flow

- **Always use TypeScript** - no plain `any` types
- **Mock data first** - Use `lib/constants.ts` for development, replace with API
  later
- **Contexts for state sharing:**
  - `AuthContext` (lib/auth-context.tsx) - User state + auth operations
  - `CartContext` (lib/cart-context.tsx) - Shopping cart + operations
  - `MenuContext` (lib/menu-context.tsx) - Active category state
- **localStorage keys:** `coffee-shop-user`, `coffee-shop-cart` (defined in
  contexts)

### Component Development (Atomic Design)

#### Creating an Atom

1. Identify the basic building block needed (button, input, text, icon)
2. Create `atoms/category/ComponentName.tsx`
3. Create `atoms/category/ComponentName.types.ts` with props interface
4. No business logic, pure props-based
5. Add to `atoms/index.ts` barrel export
6. Document in `atoms/ATOMS.md`

```tsx
// Example: atoms/buttons/Button.tsx
import type { ButtonProps } from "./Button.types";

export default function Button({ variant = "primary", ...props }: ButtonProps) {
  return <button className={variants[variant]} {...props} />;
}
```

#### Creating a Molecule

1. Identify which atoms compose this molecule
2. Create `molecules/category/ComponentName.tsx`
3. Create `molecules/category/ComponentName.types.ts`
4. Can use useState for simple UI state
5. No global context usage
6. Add to `molecules/index.ts` barrel export
7. Document in `molecules/MOLECULES.md`

```tsx
// Example: molecules/cards/ProductCard.tsx
"use client";
import Button from "@/components/atoms/buttons/Button";
import Text from "@/components/atoms/typography/Text";

import type { ProductCardProps } from "./Card.types";

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="rounded-lg border">
      {/* atoms composition */}
      <Button onClick={() => onAddToCart(product)}>Add</Button>
    </div>
  );
}
```

#### Creating an Organism

1. Identify complex section (product grid, form, modal content)
2. Create `organisms/section-type/ComponentName.tsx`
3. Create `organisms/section-type/ComponentName.types.ts`
4. Can use contexts (useAuth, useCart, useMenu)
5. Contains business logic (filtering, sorting, validation)
6. Always use `"use client"`
7. Add to `organisms/index.ts` barrel export
8. Document in `organisms/ORGANISMS.md`

```tsx
// Example: organisms/product-grid/ProductGrid.tsx
"use client";
import { useCart } from "@/lib/cart-context";
import { useMenu } from "@/lib/menu-context";
import ProductCard from "@/components/molecules/cards/ProductCard";

export default function ProductGrid() {
  const { activeCategory } = useMenu();
  const { addToCart } = useCart();

  const filtered = products.filter(p =>
    activeCategory === "all" || p.category === activeCategory
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3">
      {filtered.map(p => <ProductCard key={p.id} {...} />)}
    </div>
  );
}
```

#### Creating a Template

1. Identify page-level layout structure
2. Create `templates/layout-type/TemplateName.tsx`
3. Create `templates/layout-type/TemplateName.types.ts`
4. No data fetching, purely structural
5. Compose organisms + layout sections
6. Use children prop pattern
7. Add to `templates/index.ts` barrel export
8. Document in `templates/TEMPLATES.md`

```tsx
// Example: templates/main-layout/MainLayout.tsx
import Navbar from "@/components/organisms/navigation/Navbar";
import Header from "@/layouts/header";

import type { MainLayoutProps } from "./MainLayout.types";

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <nav className="hidden w-64 md:block">
          <Navbar />
        </nav>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
```

### Client vs Server Components

- **Atoms:** Server by default, `"use client"` if interactive (Button, Input)
- **Molecules:** `"use client"` if state needed, server if pure display
- **Organisms:** Always `"use client"` (logic, contexts)
- **Templates:** Server by default (layout), children can be client
- **Pages:** Depends on needs (route-specific logic = client)

### Testing & Quality

- **Responsive testing:** Test on mobile (< 640px), tablet (768px), desktop
  (1024px+)
- **Accessibility:** Images have alt text, buttons have semantic HTML,
  sufficient contrast
- **Performance:** Use Next.js Image component, optimize imports, lazy-load
  organisms
- **Error handling:** Validate user input at system boundaries

### Git & Commits

- **Commit message:** Follow conventional commits (`feat:`, `fix:`, `docs:`,
  `style:`, `refactor:`)
- **Before pushing:** Ensure `npm run lint` and `npm run format` pass locally
- **Markdown updates:** Include in same commit as code changes
- **Branch naming:** Feature branches = `feature_<name>` (e.g.,
  `feature_atomic_refactor`)

---

## 4) Quick Reference Guide for AI

### Atomic Design Cheat Sheet

```
ATOM              → Basic building block (Button, Text, Icon)
MOLECULE          → Atoms group (ProductCard, FormField)
ORGANISM          → Complex section (ProductGrid, LoginForm)
TEMPLATE          → Page layout (MainLayout, CheckoutLayout)
PAGE              → Specific route (app/*/page.tsx)
```

### Component Decision Tree

```
Is it a basic UI element?
  ├─ YES → ATOM (Button, Text, Icon, Input, Badge)
  └─ NO → Is it a composition of atoms?
          ├─ YES → MOLECULE (Card, FormField, SearchBar)
          └─ NO → Is it a complex section with logic/context?
                  ├─ YES → ORGANISM (ProductGrid, LoginForm, Modal)
                  └─ NO → Is it a page-level layout?
                          ├─ YES → TEMPLATE (MainLayout, CheckoutLayout)
                          └─ NO → PAGE (app/page.tsx)
```

### Creating a New Component Checklist

- [ ] Determine component level (Atom/Molecule/Organism/Template)
- [ ] Create directory: `components/[level]/[category]/`
- [ ] Create `ComponentName.tsx` with TypeScript
- [ ] Create `ComponentName.types.ts` with Props interface
- [ ] Add to `index.ts` barrel export in that level
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Update markdown documentation
- [ ] Run `npm run format` and `npm run lint`
- [ ] Commit with conventional message

### Common File Locations

- **Atoms:** `components/atoms/[category]/ComponentName.tsx`
- **Molecules:** `components/molecules/[category]/ComponentName.tsx`
- **Organisms:** `components/organisms/[section-type]/ComponentName.tsx`
- **Templates:** `components/templates/[layout-type]/TemplateName.tsx`
- **Pages:** `app/[route]/page.tsx`
- **Layouts (root):** `layouts/header.tsx`, `layouts/footer.tsx`
- **Contexts:** `lib/auth-context.tsx`, `lib/cart-context.tsx`
- **Types:** `lib/types.ts`
- **Constants:** `lib/constants.ts`

### Import Patterns

```tsx
// Atoms
import Button from "@/components/atoms/buttons/Button";
import { Button } from "@/components/atoms"; // via barrel

// Molecules
import ProductCard from "@/components/molecules/cards/ProductCard";
import { ProductCard } from "@/components/molecules";

// Organisms
import ProductGrid from "@/components/organisms/product-grid/ProductGrid";
import { ProductGrid } from "@/components/organisms";

// Templates
import MainLayout from "@/components/templates/main-layout/MainLayout";
import { MainLayout } from "@/components/templates";

// Contexts
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
```

### CSS Variables (from `globals.css`)

```css
/* Colors */
--color-primary: main brand color --color-primary-dark: darker shade
  --color-accent: secondary color --color-bg-main: main background
  --color-bg-card: card background --color-bg-sidebar: sidebar background
  --color-text-primary: main text color --color-text-secondary: secondary text
  --color-text-muted: gray/muted text --color-border: border color
  --color-border-light: light border --color-shadow-sm: small shadow
  --color-shadow-md: medium shadow /* Spacing */ --spacing-header-height: 72px;
```

### Useful Commands

```bash
# Development
npm run dev              # Start dev server

# Code quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier

# Build & Deploy
npm run build           # Build for production
npm start               # Start production server

# Release
npm run release         # Semantic release (auto-version + changelog)
```

### Common Patterns

**Filtering products by category (in Organism):**

```tsx
const filtered = MOCK_PRODUCTS.filter(
  (p) => activeCategory === "all" || p.category === activeCategory,
);
```

**Using Atoms in Molecules:**

```tsx
import Button from "@/components/atoms/buttons/Button";
import Text from "@/components/atoms/typography/Text";

export default function Card() {
  return (
    <div>
      <Text variant="body1">Product Name</Text>
      <Button onClick={handleClick}>Add</Button>
    </div>
  );
}
```

**Using Organisms in Templates:**

```tsx
import ProductGrid from "@/components/organisms/product-grid/ProductGrid";

export default function MainLayout({ children }) {
  return (
    <div>
      <header>Header</header>
      <ProductGrid />
      {children}
    </div>
  );
}
```

**Responsive classes (all levels):**

```tsx
// Mobile-first: base style applies to all, sm:/md:/lg: apply at breakpoints
className = "w-full sm:w-1/2 md:w-1/3 p-4 md:p-6 hidden md:block";
```

---

## 5) Project Status

### ✅ Completed Features

- User authentication (login, register, logout)
- Product grid display with category filtering
- Shopping cart with add/remove/update operations
- Payment page with review modal
- Shop discovery (feed page)
- Responsive design (mobile, tablet, desktop)
- Header + Footer with navigation
- Sidebar category filter

### 🚀 In Progress

- Atomic Design refactoring (components reorganization)
- Manager dashboard (quản lý sản phẩm) - `app/(manager)/` route group

### 📋 Planned Features

- Order history and tracking
- User profile page
- Real backend API integration (replace MOCK_PRODUCTS, MOCK_SHOPS)
- Dark mode toggle
- Search functionality enhancement
- Admin order management page

---

## 6) Atomic Design Documentation Structure

### `components/ATOMIC_DESIGN.md`

Master guide covering:

- Overview of 5 levels
- File structure
- Best practices
- Migration guide
- Import patterns
- Performance optimization
- Accessibility guidelines

### `components/atoms/ATOMS.md`

Atoms inventory:

- List of all atoms by category
- Props interfaces
- Variants & states
- Usage examples
- Styling guidelines

### `components/molecules/MOLECULES.md`

Molecules inventory:

- List of all molecules by category
- Atom composition
- Props interfaces
- Behavior & interactions
- Usage examples

### `components/organisms/ORGANISMS.md`

Organisms inventory:

- List of all organisms by section
- Molecule/atom composition
- Contexts used
- Business logic
- Props interfaces
- Features & behavior

### `components/templates/TEMPLATES.md`

Templates inventory:

- List of all templates by layout type
- Responsive structure
- Organism composition
- Props interfaces
- Usage examples

---

Cấu trúc này cung cấp: ✅ **Scalability**: Dễ thêm components mới với vị trí rõ
ràng ✅ **Reusability**: Maximize tái sử dụng atoms → molecules → organisms ✅
**Maintainability**: Code dễ tìm kiếm, hiểu logic ✅ **Testability**: Mỗi level
có responsibility riêng ✅ **Performance**: Smart code-splitting theo level ✅
**Documentation**: Chi tiết từng cấp độ, patterns rõ ràng
