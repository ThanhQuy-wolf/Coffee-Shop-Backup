# Components Documentation

> Whenever you create a new component in the components/ directory, automatically append a new section following the template below.

---

## CartProduct

**File:** components/CartProduct.tsx
**Description:** Product card component. Displays product image, name, description, formatted price, and a Buy button. Width is controlled by the parent grid (w-full), not the card itself.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| image | string | yes | - | URL/path to product image (Next.js Image) |
| imageAlt | string | no | Anh san pham | Alt text for accessibility |
| productName | string | yes | - | Product display name |
| price | number or string | yes | - | If number: auto-formatted to VND. If string: rendered as-is |
| description | string | yes | - | Short description, clamped to 2 lines |
| onBuy | () => void | no | undefined | Callback when Buy button is clicked |

### Internal Logic

- formattedPrice: number -> toLocaleString(vi-VN, { style: currency, currency: VND })
- Image fallback: fa-solid fa-mug-hot icon shown behind image; if image fails onError hides the img element

### Styling (CSS variables)

| Element | Key classes |
|---------|-------------|
| Card wrapper | flex flex-col w-full rounded-2xl, shadow uses --color-shadow-sm/md |
| Image area | relative w-full h-36, bg --color-border-light |
| Product name | font-bold text-sm, color --color-text-primary, line-clamp-1 |
| Description | text-xs, color --color-text-muted, line-clamp-2 |
| Price | text-sm font-bold, color --color-primary |
| Buy button | bg --color-primary, hover --color-primary-dark, active:scale-95 |

### Dependencies

- next/image
- Tailwind CSS + CSS custom properties from globals.css
- FontAwesome (fa-solid fa-mug-hot fallback, fa-cart-plus button icon)

### Notes

- Card width is w-full - controlled by parent grid in page.tsx
- available field on Product is checked in page.tsx before rendering
- onBuy currently logs to console - TODO: implement cart logic

---

## Navbar

**File:** components/Navbar.tsx
**Description:** Left sidebar with collapsible category filter. Sticky below header, full viewport height minus header.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| isOpen | boolean | yes | - | true = expanded (240px), false = collapsed (64px) |
| onToggle | () => void | yes | - | Toggle expand/collapse |
| activeCategory | string | no | all | Currently selected category id |
| onCategoryChange | (id: string) => void | no | undefined | Fired when user clicks a category |

### Behavior

- Collapsed: 64px wide, icon only (w-16)
- Expanded: 240px wide, icon + label (w-60)
- Width transition: transition-all duration-250ms
- Active category: highlighted with --color-primary background
- Footer shows SHOP_INFO.openHours (icon only when collapsed)

### Styling

| Element | Key classes |
|---------|-------------|
| Aside | sticky, border-r --color-border, bg --color-bg-sidebar |
| Toggle button | w-8 h-8 rounded-lg, hover bg --color-border-light |
| Active item | bg --color-primary text-white shadow-sm |
| Inactive item | hover bg --color-border-light, color --color-text-secondary |

### Dependencies

- next/link
- lib/constants: MENU_CATEGORIES, SHOP_INFO
- lib/types: MenuCategory
- FontAwesome icons

---

## Header (layouts/header.tsx)

**File:** layouts/header.tsx
**Description:** Sticky top bar. 2-column layout: Brand (left) + Auth button (right). Auth cycles Guest -> Manager -> Staff -> Guest for UI demo.

### Props

None - reads SHOP_INFO and MOCK_USERS from lib/constants directly.

### Internal State

| State | Type | Description |
|-------|------|-------------|
| user | User or null | Current demo user. null = guest |

### Auth States

| State | Appearance |
|-------|------------|
| Guest (null) | Brown primary button, Dang nhap label |
| Manager | Gold/caramel badge with user-tie icon |
| Staff | Avatar circle + name, bordered button |

### Responsive

- Logo + shop name: always visible
- Tagline: hidden < md, shown md+
- Button label: hidden < sm, shown sm+

### Dependencies

- next/image, next/link
- lib/constants: SHOP_INFO, MOCK_USERS
- lib/types: User
- FontAwesome icons

---

## Footer (layouts/footer.tsx)

**File:** layouts/footer.tsx
**Description:** Site footer with 12-column grid. 3 sections: Brand info, Social links, WiFi card.

### Props

None - reads SHOP_INFO and SOCIAL_LINKS from lib/constants directly.

### Layout

| Section | Mobile | md | lg/xl |
|---------|--------|----|-------|
| Brand info | col-span-12 | col-span-6 | col-span-8/6 |
| Social + WiFi | col-span-12 | col-span-6 | col-span-4/6 |

### Sections

1. Brand: logo, name, tagline, address, phone, email, open hours
2. Social: Facebook, TikTok, Website links
3. WiFi: network name + password in monospace styled box
4. Bottom bar: copyright + Made with heart in Vietnam

### Dependencies

- next/image, next/link
- lib/constants: SHOP_INFO, SOCIAL_LINKS
- FontAwesome icons
