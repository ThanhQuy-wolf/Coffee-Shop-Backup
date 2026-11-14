# Lib Documentation

Shared logic for the Drinkool frontend. Types follow `docs/04-erd.md`, service
functions follow `docs/05-api.md` (one function per endpoint, the "Hàm frontend"
column), and business rules are named `BR-xx` as in `docs/02-business-rules.md`.

## Folder layout

```
lib/
+-- types.ts                 # Domain types, camelCase of the ERD columns
+-- constants.ts             # BRAND (shop data comes from the API)
+-- contexts/                # React providers ("use client")
|   +-- auth-context.tsx     # useAuth: user, isReady, loginCustomer, loginStaff, startSession, logout
|   +-- cart-context.tsx     # useCart: cart on the device + Idempotency-Key (BR-24)
|   +-- catalog-context.tsx  # useCatalog: products/combos/categories + async CRUD
|   +-- manager-context.tsx  # useManager: catalog + active manager tab
|   +-- menu-context.tsx     # useMenu: active category on the home page menu
|   +-- shift-context.tsx    # useShift: shifts with a per-user view status + actions
+-- services/                # The ONLY place that knows where data comes from
|   +-- client.ts            # apiRequest/apiPost, ApiError(status, code, message, details)
|   +-- auth.ts              # A-1..A-9 (authService, notificationService)
|   +-- shops.ts             # S-2..S-5 (shopService: shop_info, single row)
|   +-- catalog.ts           # C-1..C-14 (catalogService)
|   +-- orders.ts            # O-1..O-9, R-1..R-2 (orderService, reviewService)
|   +-- shifts.ts            # W-1..W-12 (shiftService)
|   +-- analytics.ts         # RP-1..RP-4 (analyticsService)
+-- mock-data/               # In-memory backend, imported only by services/
|   +-- db.ts                # state, mock clock, auth helpers, background jobs
|   +-- users.ts | shops.ts | menu.ts | shifts.ts | analytics.ts
+-- hooks/
|   +-- use-local-storage.ts # useLocalStorage (hydration-safe), useHydrated
|   +-- use-guest-orders.ts  # guest tokens of orders placed on this device
+-- utils/
    +-- currency.ts          # formatVND, formatVNDShort (chart axes), formatNumber
    +-- date.ts              # week/month helpers, MONTH_NAMES_VI, WEEKDAY_LABELS_VI
    +-- order.ts             # ORDER_STATUS labels, formatDateTime, secondsUntil
    +-- errors.ts            # errorMessage(err), errorCode(err): pick UI text by code
```

## Rules

- Import each module by its own path (`@/lib/utils/currency`,
  `@/lib/contexts/auth-context`). Only `@/lib/services` has a barrel.
- Every exported function, context member and service method has JSDoc with
  `@param`, `@returns` and, for services, `@throws {ApiError}` with the code and
  the endpoint (`O-1`, `W-7`...). Keep it updated when the behaviour changes.
- **Components never import `lib/mock-data`.** They use a context or a service.
- Every service function is `async` and throws `ApiError`. Choose the message
  from `err.code` (`BR-xx`, `NOT_FOUND`...), never from `err.message`.
- To connect a real endpoint, replace the body of its service function with
  `apiRequest(...)`. Callers stay the same.
- Mount order: `AuthProvider > CartProvider` (root, `app/providers.tsx`).
  `CatalogProvider` + `ManagerProvider` are mounted by the manager layout,
  `ShiftProvider` by the schedule page, `MenuProvider` by the home page.

## Mock backend

- State lives in memory and **resets on page reload**. Client-side navigation
  keeps it, so a flow should be tested without reloading.
- Mock time starts at 10/04/2026 09:00 and runs in real time
  (`orderService.now()`, `shiftService.now()`).
- `runJobs()` runs before each call: auto-cancel unpaid orders (BR-28) and
  revert undecided leave requests (BR-48).
- Access tokens look like `mock.<userId>`.
- There is one shop (A-5): `db.shop` and `db.settings` mirror the single
  `shop_info` row, and no row carries a `shopId`. Order codes are
  `DH-YYMMDD-NNNN` (BR-25).

| Account                          | Login                                | Role     |
| -------------------------------- | ------------------------------------ | -------- |
| `admin` / `admin`                | Tab "Nhân viên quán"                 | Manager  |
| `an`, `binh`, `cuong` / `123456` | Tab "Nhân viên quán"                 | Staff    |
| `0987654321` / `user1`           | Tab "Khách hàng" (real backend, A-1) | Customer |
| OTP for registration             | `123456`                             |          |

## Backend

`/api/*` is proxied to the backend in development by `next.config.ts` (default
`http://host.docker.internal:32080`, override with `API_PROXY_URL`). Only
`POST /api/customer/login` is real today. Its user is mirrored into the mock so
the other mocked endpoints recognise the customer.
