# Lib Documentation

Shared logic and data for the Coffee Shop frontend. Everything under `lib/`
is framework-agnostic TypeScript or React client code (contexts, hooks).

## Folder layout

```
lib/
+-- types.ts                 # All domain types (User, Product, Combo, ShiftSlot...)
+-- constants.ts             # Real app config: SHOP_INFO, SOCIAL_LINKS, DEPARTMENTS
+-- contexts/                # React context providers ("use client")
|   +-- auth-context.tsx     # useAuth: user, isReady, login, logout, registration
|   +-- cart-context.tsx     # useCart: items, totals, add/remove/qty (localStorage)
|   +-- catalog-context.tsx  # useCatalog: products, combos, categories + CRUD
|   +-- manager-context.tsx  # useManager: catalog + active manager tab
|   +-- menu-context.tsx     # useMenu: active category (sidebar <-> mobile tabs)
|   +-- shift-context.tsx    # useShift: shifts, calendar navigation, register/leave
+-- services/                # The ONLY place that knows where data comes from
|   +-- client.ts            # apiPost + ApiError (fetch wrapper for /api/*)
|   +-- auth.ts              # loginRequest -> POST /api/customer/login (real backend)
|   +-- catalog.ts           # getMenuCategories/getCategories/getProducts/getCombos
|   +-- shops.ts             # getShops
|   +-- analytics.ts         # getRevenue(period), getProductSales
|   +-- shifts.ts            # getShiftSlots
+-- mock-data/               # Mock data, imported only by services/
|   +-- menu.ts | shops.ts | analytics.ts | shifts.ts
+-- hooks/
|   +-- use-local-storage.ts # useLocalStorage (hydration-safe), useHydrated
+-- utils/
    +-- currency.ts          # formatVND, formatCurrency (short), formatCurrencyFull
    +-- date.ts              # getMonday, getWeekDates, formatDateISO/Short, isToday...
    +-- analytics.ts         # calcChange (+ re-exports currency formatters)
```

## Rules

- **Components never import `lib/mock-data`.** They read data through a
  context (`useCatalog`, `useShift`...) or a service function.
- **Contexts never call `fetch`.** Network calls live in `lib/services`.
- To connect a new backend endpoint, change the body of the matching service
  function; callers stay the same.
- Mount order (`app/providers.tsx`):
  `AuthProvider > CatalogProvider > MenuProvider > CartProvider`.
  `ManagerProvider` (manager routes) and `ShiftProvider` (staff routes) are
  mounted by their layouts, behind `RoleGuard`.

## Contexts

| Hook | Provider | State | Notes |
|---|---|---|---|
| `useAuth()` | `AuthProvider` (root) | `user`, `isReady` | Session in localStorage key `coffee-shop-user`. Wait for `isReady` before treating `user === null` as logged out. |
| `useCart()` | `CartProvider` (root) | `items`, `totalItems`, `totalPrice` | localStorage key `coffee-shop-cart`. |
| `useCatalog()` | `CatalogProvider` (root) | `products`, `combos`, `categories`, `menuCategories` | In memory; resets on reload. `menuCategories` = "Tất cả" + categories. |
| `useManager()` | `ManagerProvider` (manager layout) | catalog + `activeTab` | Same CRUD as `useCatalog`, so manager edits show on the customer menu. |
| `useMenu()` | `MenuProvider` (root) | `activeCategory` | Shared by `CategorySidebar` and `MobileCategoryTabs`. |
| `useShift()` | `ShiftProvider` (staff layout) | `shifts`, `view`, `currentDate` | "Today" is `SCHEDULE_TODAY` (10/04/2026) while on mock data. |

## Usage

```tsx
import { useCatalog } from "@/lib/contexts/catalog-context";
import { formatVND } from "@/lib/utils/currency";

const { products } = useCatalog();
products.map((p) => formatVND(p.price));
```

```tsx
// Protect a route group
import { RoleGuard } from "@/components/templates/role-guard";

<RoleGuard allow={["manager"]}>{children}</RoleGuard>;
```

## Backend

`/api/*` is proxied to the backend in development by `next.config.ts`
(default `http://host.docker.internal:32080`, override with `API_PROXY_URL`).
Only login uses the real backend today; everything else is mock data.
