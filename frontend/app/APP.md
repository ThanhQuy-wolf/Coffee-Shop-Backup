# App Routes

The system serves one shop, so the home page `/` is its menu. `/feed` and
`/shops/[shopId]` were removed. Each page maps to the use cases in
`docs/03-usecase.md`; the full chain
use case → screen → service → API is in `docs/08-truy-vet.md`.

| Route | File | Who | Use case | Services |
|---|---|---|---|---|
| `/` | `(main)/page.tsx` | all | UC-04 xem menu, UC-05 giỏ hàng, UC-06 tìm món | `shopService.get`, `catalogService.getMenu` |
| `/checkout` | `(main)/checkout/page.tsx` | guest, customer | UC-07 đặt món | `orderService.create` |
| `/payment` | `(main)/payment/page.tsx` | | | redirects to `/checkout` (old link) |
| `/orders/[orderId]` | `(main)/orders/[orderId]/page.tsx` | guest (token), customer | UC-08, UC-11, UC-16 | `orderService.get/cancel`, `reviewService.create` |
| `/orders` | `(main)/orders/page.tsx` | customer | UC-09 lịch sử | `orderService.listMine` |
| `/login` | `(main)/login/page.tsx` | all | UC-02 | `authService.loginCustomer/loginStaff` |
| `/register` | `(main)/register/page.tsx` | all | UC-01 | `authService.requestOtp/register` |
| `/staff/orders` | `(staff)/staff/orders/page.tsx` | staff, manager | UC-10, UC-11 | `orderService.listQueue/confirmPayment/start/markReady/complete/cancel` |
| `/staff/schedule` | `(staff)/staff/schedule/page.tsx` | staff, manager | UC-18 → UC-22, UC-24 | `shiftService.*` |
| `/manager` | `(manager)/manager/page.tsx` | manager | UC-12 → UC-15, UC-17 | `catalogService.*`, `shopService.*`, `reviewService.list` |
| `/manager/analytics` | `(manager)/manager/analytics/page.tsx` | manager | UC-23 | `analyticsService.*` |

## Layouts and guards

- `app/layout.tsx`: fonts, FontAwesome, `<Providers>` (`AuthProvider > CartProvider`).
- `(main)`: Header + Footer + CartFab. `/orders` adds its own `RoleGuard`.
- `(staff)`: `RoleGuard allow={["STAFF","MANAGER"]}`. `/staff/orders` renders the Header.
- `(manager)`: `RoleGuard allow={["MANAGER"]}` + `CatalogProvider` + `ManagerProvider`.

`RoleGuard` waits for the saved session, sends logged-out users to `/login`
and users of another role to their own home (`homePathFor`, FR-04).

## Live data

Pages that show changing state poll every 5 s: the order page (customer
waits for the shop) and the staff order queue. A `409` (BR-26, BR-27) means
someone else acted first; the page reloads and says so.
