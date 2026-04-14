# Components Documentation

> This project follows **Atomic Design** pattern. See `Atomic.md` at project
> root for full structure guide.

## Directory Structure

```
components/
├── atoms/           # Basic building blocks (Button, Input, Text, Badge...)
├── molecules/       # Groups of atoms (ProductCard, SearchBar...)
├── organisms/       # Complex UI sections (CategorySidebar, CartFab, ProductGrid, ReviewModal, analytics charts...)
└── templates/       # Page layout structures (MainLayout, AuthLayout...)
```

---

## MOLECULES

### ProductCard (`molecules/cards/ProductCard.tsx`)

**Description:** Product card molecule. Displays product image, name,
description, formatted price, and a Buy button. Width is controlled by the
parent grid (w-full).

**Atomic level:** Molecule (composed of Button, Caption, Text atoms)

### ShopCard (`molecules/cards/ShopCard.tsx`)

**Description:** Shop discovery card. Displays shop image, name, address, and a
link to the menu.

### SearchBar (`molecules/search-bar/SearchBar.tsx`)

**Description:** Search input with clear button. Controlled component — value
and onChange come from parent.

---

## ORGANISMS

### CategorySidebar (`organisms/navigation/CategorySidebar.tsx`)

**Description:** Left sidebar with collapsible category filter. Sticky below
header, full viewport height minus header.

### CartFab (`organisms/cart/CartFab.tsx`)

**Description:** Floating Action Button displaying cart item count. Links to
/payment page.

### ProductGrid (`organisms/product-grid/ProductGrid.tsx`)

**Description:** Full product grid organism with mobile category tabs,
filtering, and empty state. Uses useCart and useMenu contexts.

### ShopGrid (`organisms/shop-grid/ShopGrid.tsx`)

**Description:** Responsive grid of ShopCard molecules for the feed/discovery
page.

### ReviewModal (`organisms/modals/ReviewModal.tsx`)

**Description:** Modal for customer reviews. Shows 5-star rating and textarea.
After submission, displays thank-you message.

### Analytics Charts (`organisms/analytics/`)

**Description:** Pure-SVG chart and table components for the Financial Analytics
dashboard. All components are interactive with hover tooltips.

| Component    | File             | Description                                                |
| ------------ | ---------------- | ---------------------------------------------------------- |
| LineChart    | LineChart.tsx    | Revenue trend line chart with area fill and hover tooltips |
| BarChart     | BarChart.tsx     | Grouped bar chart comparing current vs previous period     |
| PieChart     | PieChart.tsx     | Pie chart with interactive legend for category breakdown   |
| SummaryCard  | SummaryCard.tsx  | Metric card with period-over-period comparison indicator   |
| ProductTable | ProductTable.tsx | Sortable product sales table with profit margin badges     |

**Usage:** Imported via `@/components/organisms/analytics` barrel index.

---

## TEMPLATES

### MainLayout (`templates/main-layout/MainLayout.tsx`)

**Description:** Main layout template — wraps content with Header, Footer, and
CartFab. Used by (main) route group.

### AuthLayout (`templates/auth-layout/AuthLayout.tsx`)

**Description:** Auth layout template — centers content in screen. Used by
login/register pages.

### FeedLayout (`templates/feed-layout/FeedLayout.tsx`)

**Description:** Feed layout template. Used by the feed/discovery route group.

### ManagerLayout (`templates/manager-layout/ManagerLayout.tsx`)

**Description:** Manager layout template — auth guard + ManagerProvider. Used by
the manager route group.

---

## Contexts Documentation

### AuthContext (`lib/auth-context.tsx`)

Manages user authentication state including login, logout, and registration.
Uses localStorage for persistence.

### CartContext (`lib/cart-context.tsx`)

Manages shopping cart state with localStorage persistence. Tracks items,
quantities, and totals.

### MenuContext (`lib/menu-context.tsx`)

Provides shared activeCategory state across components. Synchronizes Header
mobile menu and CategorySidebar selection.

### ManagerContext (`lib/manager-context.tsx`)

Manages menu CRUD state (products, combos, categories) for the manager
dashboard.
