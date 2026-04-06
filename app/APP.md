# App Routes & Pages Documentation

> Tài liệu chi tiết về Next.js App Router structure, routes, và layouts

---

## Route Structure Overview

```
app/
├── layout.tsx                  # Root layout - Header + Footer wrapper
├── globals.css                 # CSS tokens + Tailwind imports
├── providers.tsx               # Context providers (Auth, Menu, Cart)
├── (main)/
│   ├── layout.tsx             # Main layout for authenticated routes
│   ├── page.tsx               # Main page - Duyệt thực đơn (/)
│   ├── login/
│   │   └── page.tsx           # Trang đăng nhập (/login)
│   ├── register/
│   │   └── page.tsx           # Trang đăng ký (/register)
│   └── payment/
│       └── page.tsx           # Trang thanh toán (/payment)
├── (feed)/
│   ├── layout.tsx             # Feed layout
│   └── feed/
│       └── page.tsx           # Trang khám phá quán (/feed)
└── (manager)/
    ├── layout.tsx             # Manager layout - auth guard + ManagerProvider
    └── manager/
        ├── page.tsx           # Manager Dashboard - quản lý thực đơn (/manager)
        └── analytics/
            └── page.tsx       # Financial Analytics (/manager/analytics)
```

---

## Root Layout (app/layout.tsx)

**Description:** Root layout wrapping entire application. Loads providers,
fonts, and common layouts (header/footer).

### Structure

- Imports providers (AuthProvider, MenuProvider, CartProvider)
- Renders Header component (sticky top)
- Renders page content via {children}
- Renders Footer component

### Metadata

- Title: "Coffee Shop"
- Charset: UTF-8
- Viewport: responsive

### Key Features

- Global CSS variables loaded here
- Header remains sticky across all pages
- Footer always present

---

## Providers (app/providers.tsx)

**Description:** Client component that wraps all context providers for the
application.

### Providers Included

1. **AuthProvider** (lib/auth-context.tsx)
   - Manages user authentication state
   - Persists user in localStorage
   - Enables login/logout/register flows

2. **MenuProvider** (lib/menu-context.tsx)
   - Shares active category state
   - Syncs Header mobile menu and Navbar sidebar

3. **CartProvider** (lib/cart-context.tsx)
   - Manages shopping cart state
   - Persists cart items in localStorage
   - Provides add/remove/update operations

### Usage in Root Layout

```tsx
<Providers>
  <Header />
  {children}
  <Footer />
</Providers>
```

---

## (main) Route Group

### Layout (app/(main)/layout.tsx)

**Description:** Layout for authenticated/main routes. Can include
route-specific UI (e.g., sidebar navigation).

### Usage

- Wraps all pages under `(main)/` route group
- Inherits root layout above it
- Can add additional styling or structure specific to main pages

---

## Pages

### 1. Main Page - Duyệt Thực Đơn (app/(main)/page.tsx)

**Route:** `/` (default) or `/(main)` **Type:** Client component
**Description:** Main shopping interface. Shows product grid with sidebar
category filter.

#### Key Features

- **Sidebar (Navbar):**
  - Collapsible (64px collapsed / 240px expanded)
  - Category list with icons
  - Sticky, full viewport height minus header
  - Responsive: desktop (expanded) vs mobile (collapsed)

- **Product Grid:**
  - Responsive columns (1/2/3/4/5 depending on sidebar state and screen size)
  - Filter by: availability, active category, search query
  - Search bar with clear button
  - Empty state when no products match

- **Mobile Category Menu:**
  - Visible only on screens < md (768px)
  - Sticky scrollable tabs below search
  - Allows category selection on mobile

#### Context Usage

- **useMenu()** - Get/set active category
- **useCart()** - Add products to cart
- **MenuContext** - Shares category state with Header

#### State Management

```tsx
isSidebarOpen: boolean; // Sidebar expanded/collapsed
searchQuery: string; // Search input value
activeCategory: string; // From MenuContext
```

#### Responsive Behavior

- **Mobile (<480px):** 1 col, sidebar collapsed
- **Small phone (480px):** 2 cols, sidebar collapsed
- **Tablet (768px):** Mobile menu tabs appear
- **Desktop (1024px):** Sidebar expands, 2-4 cols depending on sidebar
- **Large screen (1280px+):** 3-5 cols

---

### 2. Login Page (app/(main)/login/page.tsx)

**Route:** `/login` **Type:** Client component **Description:** User
authentication form. Supports login for Manager, Staff, and Customer roles.

#### Key Features

- **Form Fields:**
  - Username input (with icon)
  - Password input (with show/hide toggle)
  - "Dang nhap" button
  - "Dang ky tai khoan" link to register

- **Validation:**
  - Username: required, non-empty
  - Password: required, min 4 characters
  - Error messages displayed inline

- **Demo Credentials:**
  - Shows example accounts for testing:
    - Manager: `admin / admin`
    - Staff: `Nguyễn Văn An / Nguyễn Văn An`
    - Customer: `0987654321 / user1`

- **UI:**
  - Centered card (max-width: 448px)
  - Shop logo and name at top
  - Error messages with icons
  - Responsive design

#### Context Usage

- **useAuth()** - Login function

#### Navigation

- Success: redirect to `/` (main page)
- Register link: go to `/register`

---

### 3. Register Page (app/(main)/register/page.tsx)

**Route:** `/register` **Type:** Client component **Description:** User
registration flow. Two-step process: phone verification → account creation.

#### Key Features

- **Step 1: Phone Verification**
  - Input phone number
  - "Request OTP" button
  - Mock OTP validation (no real SMS)

- **Step 2: Account Creation** (after OTP)
  - Confirm phone number
  - "Create Account" button
  - Auto-login after registration

- **Validation:**
  - Phone format validation
  - OTP code validation

- **UI:**
  - Centered card layout
  - Step indicator
  - Progress feedback

#### Context Usage

- **useAuth()** - completeRegistration()

#### Navigation

- Success: redirect to `/` (main page)
- Login link: go to `/login`

---

### 4. Payment Page (app/(main)/payment/page.tsx)

**Route:** `/payment` **Type:** Client component **Description:**
Payment/checkout page. Shows cart items in a table with quantity controls and a
summary aside with payment actions.

#### Key Features

- **Cart Table:**
  - Lists all cart items (name, price, description, quantity controls, delete)
  - Quantity input with +/- buttons and direct number input
  - Empty state message when cart is empty
  - Horizontal scroll on small screens (min-w-190)

- **Invoice Aside:**
  - Sticky on desktop (top offset = header height + 1rem)
  - Shows total price
  - Payment buttons: Tiền mặt, QR Code (UI-only; trigger review modal for
    customers)
  - **"Đánh giá" button** — only visible when `user.role === "customer"`; opens
    ReviewModal
  - **"Quay về" button** — links back to `/`; spans full width when review
    button is absent

- **Review Modal (ReviewModal):**
  - Opened when a customer clicks "Đánh giá" OR clicks a payment button (Tiền
    mặt/QR)
  - Closed via "Quay lại" button, backdrop click, or after submitting and
    closing
  - See `components/ReviewModal.tsx` for full documentation

#### Context Usage

- **useCart()** — items, totalPrice, increaseQty, decreaseQty, removeFromCart,
  setQuantity
- **useAuth()** — user (to check `user.role === "customer"` for review button
  visibility)

#### State Management

```tsx
isReviewOpen: boolean; // Controls ReviewModal visibility
isCustomer: boolean; // Derived from user.role === "customer"
```

#### Responsive Behavior

- **Mobile:** Single column layout, table scrolls horizontally, button labels
  hidden (icon only)
- **Desktop (lg+):** Button labels visible, aside becomes sticky sidebar (xl:
  w-85)
- **Review button grid:** When customer is logged in, 3 buttons in 2-column
  grid; "Quay về" occupies remaining space. Otherwise 2-column grid with "Quay
  về" spanning full width.

---

## (feed) Route Group

### Layout (app/(feed)/layout.tsx)

**Description:** Layout for feed routes. Can have specific styling for
discovery/exploration pages.

---

### Feed Page - Khám Phá Quán (app/(feed)/feed/page.tsx)

**Route:** `/feed` **Type:** Client component **Description:** Discover coffee
shops. Browse and search available shops with their location and details.

#### Key Features

- **Shop Cards:**
  - Shop image (responsive height)
  - Name and location
  - "Xem menu" button (links to `/`)
  - Hover effects with shadow/lift animation

- **Search & Filter:**
  - Sticky bottom filter bar
  - Search by shop name
  - Search by address
  - Clear buttons for each field

- **Grid Layout:**
  - Responsive (1/2/3 columns)
  - Adjusts to screen size

- **Empty State:**
  - Icon and message when no shops match
  - Clear filter button

#### Context Usage

- **useAuth()** - Optional: check user role

#### State Management

```tsx
searchName: string      // Shop name search
searchAddress: string   // Shop address search
filteredShops: Shop[]   // Filtered results
```

#### Data Source

- MOCK_SHOPS from lib/constants.ts

---

## CSS & Styling

### Global Styles (app/globals.css)

**Description:** Root CSS file. Imports Tailwind CSS, defines design tokens (CSS
variables), and global styles.

### Design Tokens (CSS Variables)

Defined at `:root` for light mode, with dark mode variants:

#### Colors

- `--color-primary` - Main brand color (brown)
- `--color-primary-dark` - Darker shade for hover
- `--color-accent` - Secondary accent color
- `--color-bg-*` - Background colors (main, card, sidebar)
- `--color-border-*` - Border colors
- `--color-text-*` - Text colors (primary, secondary, muted)
- `--color-shadow-*` - Shadow colors (sm, md)

#### Spacing

- `--spacing-header-height` - Header component height
- Standard Tailwind spacing (via Tailwind)

#### Typography

- Font stack defined via Google Fonts (Geist)

### Tailwind Config Integration

- v4 with custom properties support
- Extends with CSS variables
- Dark mode: CSS variable override

---

## Key Concepts

### Route Groups

- `(main)` and `(feed)` are route groups (don't appear in URL)
- Allow different layouts/providers per route group
- Used for organization and flexibility

### SSR vs Client Components

- Most pages are "use client" (need interactivity)
- Context providers must be client components
- Layout.tsx can be server component

### Responsive Design

- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Sidebar width affects grid columns
- Mobile: vertical layout, collapsed sidebar
- Desktop: horizontal layout, expanded sidebar

### Navigation

- Internal links use `next/link`
- useRouter() for programmatic navigation
- Auth redirects after login/register

---

## Development Workflow

### Adding a New Page

1. Create file under appropriate route group: `app/(main)/new-feature/page.tsx`
2. Make it a client component if it needs interactivity: `"use client"`
3. Use context hooks as needed (useAuth, useCart, useMenu)
4. Export default component
5. Add to documentation

### Adding a New Route Group

1. Create directory: `app/(group-name)/`
2. Create `layout.tsx` if custom layout needed
3. Add pages under this group
4. Update codebase understanding

### Styling Pages

- Use Tailwind classes + CSS variables
- Reference design tokens for consistency
- Follow responsive patterns from existing pages

---

## (manager) Route Group

### Layout (app/(manager)/layout.tsx)

**Description:** Layout for manager routes. Guards access — redirects
non-managers to `/`. Wraps children in `ManagerProvider`.

---

### Manager Dashboard (app/(manager)/manager/page.tsx)

**Route:** `/manager` **Type:** Client component **Description:** Full menu
management interface for the shop owner.

#### Key Features

- **Sidebar (desktop):** Brand, tab navigation (Thực đơn / Combo / Danh mục),
  link to Financial Analytics, user info, logout
- **Top bar:** Page title, mobile tab switcher, analytics shortcut button
- **Tabs:** Products, Combos, Categories — each with CRUD modals
- **Analytics link:** `fa-chart-line` button → `/manager/analytics`

---

### Financial Analytics (app/(manager)/manager/analytics/page.tsx)

**Route:** `/manager/analytics` **Type:** Client component **Description:**
Financial analytics and reporting dashboard for the shop manager.

#### Key Features

- **Summary cards:** Total revenue, orders, profit, average order value — each
  with period-over-period comparison %
- **Period selector:** Day / Week / Month / Year — switches revenue dataset
- **Chart switcher:** Line chart (trend), Bar chart (current vs previous half),
  Pie chart (revenue by category)
- **SVG charts:** Pure SVG, no external library — hover tooltips stay inside
  viewBox (auto-flip above/below for line points & bar tops), interactive
  dots/slices
- **Top 5 products:** Horizontal bar ranking filtered by category
- **Product detail table:** All 18 products sortable by units sold, revenue,
  profit, margin
- **Summary row:** Totals for filtered data (revenue, profit, volume, avg
  margin)
- **Category filter:** Dropdown to filter both top-5 and detail table

#### Data Sources

- `MOCK_REVENUE_DAILY/WEEKLY/MONTHLY/YEARLY` from `lib/constants.ts`
- `MOCK_PRODUCT_SALES` from `lib/constants.ts`
- `MENU_CATEGORIES` for category labels

#### State Management

```tsx
period: AnalyticsPeriod; // "day" | "week" | "month" | "year"
activeChart: "line" | "bar" | "pie";
categoryFilter: string; // category id or "all"
```

---

## Future Enhancements

- [x] Payment page implementation
- [x] Customer review modal (ReviewModal) with 5-star rating + textarea
- [x] Manager dashboard (menu management)
- [x] Financial Analytics dashboard (charts, profit analysis)
- [ ] Order history/tracking page
- [ ] User profile page
- [ ] Cart checkout flow
- [ ] Real backend API integration
