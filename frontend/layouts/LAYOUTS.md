# Layouts

```
layouts/
├── header.tsx   # Sticky top bar: platform brand, role links, notifications, account
└── footer.tsx   # Platform info and social links
```

Both show the **platform** (Drinkool, `PLATFORM_INFO` in `lib/constants.ts`).
A shop's own name, address, opening hours and WiFi are shown on its menu page
(`/shops/[shopId]`), because the platform hosts many shops.

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

Brand, support phone and email from `PLATFORM_INFO`, social links from
`SOCIAL_LINKS`, and the copyright bar. It stacks to one column on mobile.

## Where they are mounted

- `(main)` routes: `MainLayout` (Header, Footer, CartFab).
- `(feed)` routes: `FeedLayout` (Header, CartFab).
- `/staff/orders`: renders `Header` itself. The schedule and manager pages use
  their own sidebars and headers.
