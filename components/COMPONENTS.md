# Components Documentation

> Whenever you create a new component in the components/ directory,
> automatically append a new section following the template below.

---

## CartProduct

**File:** components/CartProduct.tsx **Description:** Product card component.
Displays product image, name, description, formatted price, and a Buy button.
Width is controlled by the parent grid (w-full), not the card itself.

### Props

| Prop        | Type             | Required | Default      | Description                                                 |
| ----------- | ---------------- | -------- | ------------ | ----------------------------------------------------------- |
| image       | string           | yes      | -            | URL/path to product image (Next.js Image)                   |
| imageAlt    | string           | no       | Anh san pham | Alt text for accessibility                                  |
| productName | string           | yes      | -            | Product display name                                        |
| price       | number or string | yes      | -            | If number: auto-formatted to VND. If string: rendered as-is |
| description | string           | yes      | -            | Short description, clamped to 2 lines                       |
| onBuy       | () => void       | no       | undefined    | Callback when Buy button is clicked                         |

### Internal Logic

- formattedPrice: number -> toLocaleString(vi-VN, { style: currency, currency:
  VND })
- Image fallback: fa-solid fa-mug-hot icon shown behind image; if image fails
  onError hides the img element

### Styling (CSS variables)

| Element      | Key classes                                                        |
| ------------ | ------------------------------------------------------------------ |
| Card wrapper | flex flex-col w-full rounded-2xl, shadow uses --color-shadow-sm/md |
| Image area   | relative w-full h-36, bg --color-border-light                      |
| Product name | font-bold text-sm, color --color-text-primary, line-clamp-1        |
| Description  | text-xs, color --color-text-muted, line-clamp-2                    |
| Price        | text-sm font-bold, color --color-primary                           |
| Buy button   | bg --color-primary, hover --color-primary-dark, active:scale-95    |

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

**File:** components/Navbar.tsx **Description:** Left sidebar with collapsible
category filter. Sticky below header, full viewport height minus header.

### Props

| Prop             | Type                 | Required | Default   | Description                                       |
| ---------------- | -------------------- | -------- | --------- | ------------------------------------------------- |
| isOpen           | boolean              | yes      | -         | true = expanded (240px), false = collapsed (64px) |
| onToggle         | () => void           | yes      | -         | Toggle expand/collapse                            |
| activeCategory   | string               | no       | all       | Currently selected category id                    |
| onCategoryChange | (id: string) => void | no       | undefined | Fired when user clicks a category                 |

### Behavior

- Collapsed: 64px wide, icon only (w-16)
- Expanded: 240px wide, icon + label (w-60)
- Width transition: transition-all duration-250ms
- Active category: highlighted with --color-primary background
- Footer shows SHOP_INFO.openHours (icon only when collapsed)

### Styling

| Element       | Key classes                                                 |
| ------------- | ----------------------------------------------------------- |
| Aside         | sticky, border-r --color-border, bg --color-bg-sidebar      |
| Toggle button | w-8 h-8 rounded-lg, hover bg --color-border-light           |
| Active item   | bg --color-primary text-white shadow-sm                     |
| Inactive item | hover bg --color-border-light, color --color-text-secondary |

### Dependencies

- next/link
- lib/constants: MENU_CATEGORIES, SHOP_INFO
- lib/types: MenuCategory
- FontAwesome icons

---

## Header (layouts/header.tsx)

**File:** layouts/header.tsx **Description:** Sticky top bar. 2-column layout:
Brand (left) + Auth button (right). Auth cycles Guest -> Manager -> Staff ->
Guest for UI demo.

### Props

None - reads SHOP_INFO and MOCK_USERS from lib/constants directly.

### Internal State

| State | Type         | Description                     |
| ----- | ------------ | ------------------------------- |
| user  | User or null | Current demo user. null = guest |

### Auth States

| State        | Appearance                            |
| ------------ | ------------------------------------- |
| Guest (null) | Brown primary button, Dang nhap label |
| Manager      | Gold/caramel badge with user-tie icon |
| Staff        | Avatar circle + name, bordered button |

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

**File:** layouts/footer.tsx **Description:** Site footer with 12-column grid. 3
sections: Brand info, Social links, WiFi card.

### Props

None - reads SHOP_INFO and SOCIAL_LINKS from lib/constants directly.

### Layout

| Section       | Mobile      | md         | lg/xl        |
| ------------- | ----------- | ---------- | ------------ |
| Brand info    | col-span-12 | col-span-6 | col-span-8/6 |
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

---

## CartFab

**File:** components/CartFab.tsx **Description:** Floating Action Button
displaying cart item count. Shows badge with number of items and total price on
hover.

### Props

| Prop    | Type       | Required | Default   | Description                  |
| ------- | ---------- | -------- | --------- | ---------------------------- |
| onClick | () => void | no       | undefined | Callback when FAB is clicked |

### Features

- Displays cart icon with item count badge
- Shows total price on hover in tooltip
- Sticky position (bottom-right)
- Uses cart context to get items and total

### Styling

| Element    | Key classes                                     |
| ---------- | ----------------------------------------------- |
| FAB button | fixed bottom-6 right-6, rounded-full, shadow-lg |
| Badge      | absolute top-0 right-0, red bg, small font      |
| Tooltip    | appears on hover, shows total price             |

### Dependencies

- lib/cart-context: useCart()
- FontAwesome icons

---

## ReviewModal

**File:** components/ReviewModal.tsx **Description:** Modal for customer
reviews. Shows a 5-star rating selector and a textarea for written feedback.
After submission, displays a thank-you message. Appears on the payment page for
customers (via a dedicated "Đánh giá" button) and also opens automatically after
a successful payment action.

### Props

| Prop    | Type       | Required | Default | Description                               |
| ------- | ---------- | -------- | ------- | ----------------------------------------- |
| isOpen  | boolean    | yes      | -       | Controls modal visibility                 |
| onClose | () => void | yes      | -       | Callback to close the modal & reset state |

### Behavior

- **Star rating:** 5 interactive stars; hover highlights up to hovered star,
  click locks selection. Disabled submit button until at least 1 star selected.
- **Star labels:** 1 = Rất tệ, 2 = Tệ, 3 = Bình thường, 4 = Tốt, 5 = Xuất sắc
- **Textarea:** Optional free-text review (placeholder in Vietnamese).
- **Footer buttons:**
  - "Quay lại" — closes modal without submitting; resets all state.
  - "Xác nhận" — submits (UI-only); transitions to thank-you state.
- **Thank-you state:** Replaces form with "Cảm ơn quý khách" message + close
  button.
- **Backdrop click:** Also closes the modal (same as "Quay lại").
- **State reset:** All state (rating, hover, review text, submitted) resets on
  close.

### Styling

| Element         | Key classes                                                             |
| --------------- | ----------------------------------------------------------------------- |
| Backdrop        | fixed inset-0, bg-black/50 backdrop-blur-sm, z-50                       |
| Modal panel     | max-w-md, rounded-2xl, border --color-border-light, white bg, shadow-xl |
| Stars           | text-3xl sm:text-4xl, hover:scale-110, active:scale-95                  |
| Active star     | fa-solid fa-star text-yellow-400                                        |
| Inactive star   | fa-regular fa-star text-(--color-border)                                |
| Textarea        | rounded-xl, focus:ring with --color-primary/20                          |
| Quay lại button | border --color-border, hover --color-border-light                       |
| Xác nhận button | bg --color-primary, disabled:opacity-50                                 |
| Thank-you icon  | fa-solid fa-heart text-(--color-accent), --color-accent-light bg        |

### Responsive

- Padding: `p-6 sm:p-8` — larger on sm+ screens
- Stars: `text-3xl sm:text-4xl`
- Modal width: `w-full max-w-md` with `p-4` page padding — works on all screen
  sizes

### Dependencies

- React useState
- FontAwesome icons (fa-star, fa-regular fa-star, fa-heart, fa-arrow-left,
  fa-check)
- Tailwind CSS + CSS custom properties from globals.css

### Usage in Payment Page

```tsx
// Only shown for customers (user.role === "customer")
const [isReviewOpen, setIsReviewOpen] = useState(false);

// Button in payment aside (only visible to customers)
<button onClick={() => setIsReviewOpen(true)}>Đánh giá</button>;

// Payment buttons (Tiền mặt / QR Code) also open the modal for customers
const handlePayment = () => {
  if (isCustomer) setIsReviewOpen(true);
};

<ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />;
```

---

# Contexts Documentation

## AuthContext (lib/auth-context.tsx)

**File:** lib/auth-context.tsx **Description:** Manages user authentication
state including login, logout, and registration. Uses localStorage for
persistence.

### Provider Props

| Prop     | Type            | Required | Description      |
| -------- | --------------- | -------- | ---------------- |
| children | React.ReactNode | yes      | Child components |

### Hook: useAuth()

Returns `AuthContextType` with:

| Property             | Type                                            | Description                                       |
| -------------------- | ----------------------------------------------- | ------------------------------------------------- |
| user                 | User \| null                                    | Current logged-in user or null                    |
| login                | (username: string, password: string) => boolean | Login function; returns success status            |
| logout               | () => void                                      | Logout function; clears user and localStorage     |
| registerPhone        | string \| null                                  | Phone number during registration flow             |
| setRegisterPhone     | (phone: string \| null) => void                 | Update registerPhone state                        |
| completeRegistration | (phone: string) => void                         | Complete registration and create customer account |

### Mock Database

Pre-configured accounts:

- Manager: `admin / admin`
- Staff: `Nguyễn Văn An / Nguyễn Văn An`, `Trần Thị Bình / Trần Thị Bình`, etc.
- Customer: Phone number as username, `user1` as password

### Storage

- Key: `coffee-shop-user`
- Format: JSON serialized User object

---

## CartContext (lib/cart-context.tsx)

**File:** lib/cart-context.tsx **Description:** Manages shopping cart state with
localStorage persistence. Tracks items, quantities, and totals.

### Provider Props

| Prop     | Type            | Required | Description      |
| -------- | --------------- | -------- | ---------------- |
| children | React.ReactNode | yes      | Child components |

### Hook: useCart()

Returns `CartContextValue` with:

| Property       | Type                                   | Description                                               |
| -------------- | -------------------------------------- | --------------------------------------------------------- |
| items          | CartItem[]                             | Array of items in cart                                    |
| totalItems     | number                                 | Total quantity of items                                   |
| totalPrice     | number                                 | Total price in VND                                        |
| addToCart      | (product: Product) => void             | Add or increase product quantity                          |
| increaseQty    | (id: number) => void                   | Increase product quantity by 1                            |
| decreaseQty    | (id: number) => void                   | Decrease product quantity by 1 (removes if qty reaches 0) |
| removeFromCart | (id: number) => void                   | Remove product from cart                                  |
| setQuantity    | (id: number, quantity: number) => void | Set exact quantity (removes if 0)                         |

### CartItem Interface

```typescript
interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}
```

### Storage

- Key: `coffee-shop-cart`
- Format: JSON serialized CartItem[]
- Auto-loads on mount and auto-saves on change

---

## MenuContext (lib/menu-context.tsx)

**File:** lib/menu-context.tsx **Description:** Provides shared category/menu
state across components. Synchronizes Header mobile menu and Navbar sidebar
selection.

### Provider Props

| Prop     | Type            | Required | Description      |
| -------- | --------------- | -------- | ---------------- |
| children | React.ReactNode | yes      | Child components |

### Hook: useMenu()

Returns `MenuContextType` with:

| Property          | Type                 | Description                                     |
| ----------------- | -------------------- | ----------------------------------------------- |
| activeCategory    | string               | Currently selected category id (default: "all") |
| setActiveCategory | (id: string) => void | Update active category                          |

### Use Cases

- Sync Navbar sidebar and Header mobile menu category selection
- Clear search query when category changes (implemented in main page)
- Pass selected category to product filter logic

### Default Value

- `activeCategory: "all"` - Show all products by default
