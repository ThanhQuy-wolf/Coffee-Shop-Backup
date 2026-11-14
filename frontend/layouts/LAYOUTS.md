# Layouts

```
layouts/
├── header.tsx   # Sticky top bar: brand, role links, notifications, account
└── footer.tsx   # Shop contact details and social links (S-2)
```

The system serves one shop. The header shows the app brand (`BRAND` in
`lib/constants.ts`). The footer and the home page `/` show the shop's own
name, address, opening hours and WiFi from `shopService.get()` (`shop_info`).

## Header

| Logged in as | Links |
|---|---|
| nobody | "Đăng nhập" button |
| CUSTOMER | Đơn của tôi (`/orders`) |
| STAFF | Đơn hàng (`/staff/orders`), Ca làm (`/staff/schedule`) |
| MANAGER | Quản lý (`/manager`), Đơn hàng, Ca làm |

Logged-in users also get `NotificationBell` (A-8, A-9: shift cancelled, leave
approved/rejected/expired) and an account button that logs out. Link labels
are hidden below `lg`, the name below `md`; icons stay.

## Footer

Shop name, tagline, address, opening hours, phone, email and social links from
`shopService.get()`, and the copyright bar. Until the data loads it shows only
the brand. It stacks to one column on mobile.

## Where they are mounted

- `(main)` routes: `MainLayout` (Header, Footer, CartFab).
- `/staff/orders`: renders `Header` itself. The schedule and manager pages use
  their own sidebars and headers.
