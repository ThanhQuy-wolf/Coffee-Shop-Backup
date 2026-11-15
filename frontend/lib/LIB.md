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
|   +-- client.ts            # apiFetch/apiRequest/apiPost/query, ApiError, token refresh (A-5)
|   +-- auth.ts              # A-1..A-9 (authService, notificationService)
|   +-- shops.ts             # S-2..S-5 (shopService: shop_info, single row)
|   +-- catalog.ts           # S-6, C-1..C-19 (catalogService)
|   +-- orders.ts            # O-1..O-9, R-1..R-2 (orderService, reviewService)
|   +-- shifts.ts            # W-1..W-12 (shiftService)
|   +-- analytics.ts         # RP-1..RP-4 (analyticsService)
+-- hooks/
|   +-- use-local-storage.ts # useLocalStorage (hydration-safe), useHydrated
|   +-- use-guest-orders.ts  # guest tokens of orders placed on this device
|   +-- use-element-width.ts # useElementWidth: live width for the SVG charts
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
- **Components never call `fetch` themselves.** They use a context or a service.
- Every service function returns a promise and throws `ApiError`. Choose the
  message from `err.code` (`BR-xx`, `NOT_FOUND`...), never from `err.message`.
- Mount order: `AuthProvider > CartProvider` (root, `app/providers.tsx`).
  `CatalogProvider` + `ManagerProvider` are mounted by the manager layout,
  `ShiftProvider` by the schedule page, `MenuProvider` by the home page.

## Backend

Every service calls the Spring Boot backend in `../backend` through `/api/*`.
`next.config.ts` rewrites it to `API_PROXY_URL` (default
`http://localhost:8080`); the value is fixed at build time.

- `AuthProvider` stores the session in localStorage and hands the tokens to
  `client.ts`. A call that gets 401 refreshes once with A-5 and is retried;
  calls made at the same time share that refresh, because reusing a refresh
  token revokes every session. A failed refresh logs the user out.
- O-2 sends `If-None-Match`, so polling an unchanged order gets a 304 and the
  cached order.
- `orderService.now()` and `shiftService.now()` are the browser clock.
- O-4 shows one business day, today when no date is given.

Demo accounts come from `backend/src/main/resources/db/dev` (profile `dev`):

| Account                          | Login                | Role     |
| -------------------------------- | -------------------- | -------- |
| `admin` / `admin`                | Tab "Nhân viên quán" | Manager  |
| `an`, `binh`, `cuong` / `123456` | Tab "Nhân viên quán" | Staff    |
| `0987654321` / `user1`           | Tab "Khách hàng"     | Customer |
| OTP for registration             | `123456`             |          |
