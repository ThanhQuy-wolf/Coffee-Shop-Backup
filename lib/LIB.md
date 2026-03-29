# Lib Documentation

> Tài liệu chi tiết về utilities, contexts, types, và constants

---

## Overview

The `lib/` directory contains shared logic, data models, and context providers used throughout the application.

```
lib/
├── types.ts              # TypeScript interfaces and types
├── constants.ts          # Mock data (products, shops, users, info)
├── auth-context.tsx      # Authentication context & provider
├── cart-context.tsx      # Shopping cart context & provider
├── menu-context.tsx      # Menu/category context & provider
└── LIB.md               # (this file)
```

---

## Types (lib/types.ts)

**Description:** Central TypeScript definitions used throughout the application.

### User Type

```typescript
type UserRole = "manager" | "staff" | "customer";

interface User {
  id: number;
  name: string;
  role: UserRole;
  avatar: string | null;
  phone?: string;
}
```

**Usage:** Authentication context, header component, role-based UI

**Roles:**
- **manager** - Shop owner, full access to menu management and orders
- **staff** - Staff member, can view/process orders
- **customer** - Regular customer, can browse and order

---

### Menu Types

```typescript
interface MenuCategory {
  id: string;
  name: string;
  icon: string; // FontAwesome class e.g. "fa-solid fa-mug-hot"
}
```

**Usage:** Sidebar navigation, category filter, product display

**Example Categories:**
- `all` - All products
- `cafe` - Coffee
- `tra` - Tea
- `sua-chua` - Yogurt
- `nuoc-ep` - Juice
- `latte` - Latte drinks
- `giai-khat` - Snacks
- `topping` - Toppings

---

### Product Type

```typescript
interface Product {
  id: number;
  name: string;
  category: string; // matches MenuCategory.id
  price: number;
  image: string;
  description: string;
  available?: boolean;
}
```

**Usage:** Product grid display, cart items, filtering

**Key Fields:**
- `id` - Unique product identifier
- `name` - Display name in Vietnamese
- `category` - Category ID for filtering
- `price` - Price in VND
- `image` - URL or path to product image
- `description` - Short 1-2 sentence description
- `available` - If `false`, product won't show (defaults to `true`)

---

### Shop Info Type

```typescript
interface WifiInfo {
  name: string;
  password: string;
}

interface ShopInfo {
  name: string;
  tagline: string;
  logo: string;
  address: string;
  phone: string;
  managerPhone: string;
  email: string;
  wifi: WifiInfo;
  openHours: string;
}
```

**Usage:** Header, footer, login page display

**Example:**
```typescript
const SHOP_INFO: ShopInfo = {
  name: "Coffee Shop",
  tagline: "Hương vị đậm đà – Khoảnh khắc thư giãn",
  logo: "/imgs/logo.png",
  address: "123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
  phone: "0901 234 567",
  managerPhone: "0912 345 678",
  email: "contact@coffeeshop.vn",
  wifi: { name: "CoffeeShop_Free", password: "coffee2024" },
  openHours: "07:00 – 22:00 (Thứ 2 – Chủ nhật)",
};
```

---

### Social Links Type

```typescript
interface SocialLinks {
  facebook: string;
  tiktok: string;
  website: string;
}
```

**Usage:** Footer component

---

### Shop (Discovery) Type

```typescript
interface Shop {
  id: number;
  name: string;
  address: string;
  image: string;
}
```

**Usage:** Feed page - list of coffee shops to discover

---

## Constants (lib/constants.ts)

**Description:** Mock data used throughout the application. Replace with API calls when backend is ready.

### SHOP_INFO

Single instance of shop information displayed in header, footer, and login page.

**Key Info Used:**
- Header: name, logo, phone
- Footer: all fields
- Login: logo, name, email

---

### SOCIAL_LINKS

Social media links for footer component.

```typescript
export const SOCIAL_LINKS: SocialLinks = {
  facebook: "https://facebook.com/coffeeshop",
  tiktok: "https://tiktok.com/@coffeeshop",
  website: "/",
};
```

---

### MENU_CATEGORIES

Array of 8 product categories. Used in sidebar, mobile menu, and product filtering.

```typescript
export const MENU_CATEGORIES: MenuCategory[] = [
  { id: "all", name: "Tất cả", icon: "fa-solid fa-border-all" },
  { id: "cafe", name: "Cà Phê", icon: "fa-solid fa-mug-hot" },
  { id: "tra", name: "Trà", icon: "fa-solid fa-leaf" },
  { id: "sua-chua", name: "Sữa Chua", icon: "fa-solid fa-jar" },
  { id: "nuoc-ep", name: "Nước Ép", icon: "fa-solid fa-blender" },
  { id: "latte", name: "Latte", icon: "fa-solid fa-mug-saucer" },
  { id: "giai-khat", name: "Giải Khát / Ăn Vặt", icon: "fa-solid fa-ice-cream" },
  { id: "topping", name: "Topping", icon: "fa-solid fa-layer-group" },
];
```

**Usage:**
- Navbar sidebar category buttons
- Header mobile scrollable menu
- Product grid category filter

---

### MOCK_PRODUCTS

Array of 18 mock product items across all categories.

**Example Product:**
```typescript
{
  id: 1,
  name: "Cà Phê Đen",
  category: "cafe",
  price: 25000,
  image: "/imgs/products/placeholder.jpg",
  description: "Cà phê đen truyền thống, đậm đà hương vị Việt Nam, pha phin thủ công.",
  available: true,
}
```

**Product Distribution:**
- Café: 4 items (Đen, Sữa, Bạc Xỉu, Trứng)
- Tea: 3 items (Đào Cam Sả, Matcha, Vải Hoa Nhài)
- Yogurt: 2 items (Trân Châu, Dâu)
- Juice: 2 items (Cam, Dưa Hấu)
- Latte: 2 items (Caramel, Vanilla)
- Snacks: 2 items (Bánh Mì, Bánh Flan)
- Toppings: 3 items (Trân Châu Đen, Thạch, Trân Châu Trắng)

**Price Range:** 10,000 - 45,000 VND

---

### MOCK_SHOPS

Array of 5 coffee shops for the feed/discovery page.

```typescript
{
  id: 1,
  name: "The Coffee House",
  address: "86 Cao Thắng, Quận 3, TP. Hồ Chí Minh",
  image: "https://images.unsplash.com/...", // Unsplash URL
}
```

**Shops:**
1. The Coffee House - Quận 3
2. Highlands Coffee - Quận 1
3. Phúc Long Heritage - Quận 1
4. Katinat Saigon Kafe - Quận 1
5. Trung Nguyên E-Coffee - Quận 1

**Usage:** Feed page grid display

---

### MOCK_USERS

Pre-configured user accounts for authentication demo.

```typescript
export const MOCK_USERS: Record<string, User> = {
  manager: {
    id: 1,
    name: "Nguyễn Văn An",
    role: "manager",
    avatar: null,
  },
  staff: {
    id: 2,
    name: "Trần Thị Bình",
    role: "staff",
    avatar: null,
  },
};
```

**Usage:** AuthContext for login demo

**Note:** More accounts defined in `auth-context.tsx` MOCK_AUTH_DB

---

## Auth Context (lib/auth-context.tsx)

See [COMPONENTS.md - AuthContext](../components/COMPONENTS.md#authcontext) for detailed documentation.

**Quick Summary:**
- Manages user login/logout/register
- Persists user in localStorage
- Provides user info to components via useAuth() hook

---

## Cart Context (lib/cart-context.tsx)

See [COMPONENTS.md - CartContext](../components/COMPONENTS.md#cartcontext) for detailed documentation.

**Quick Summary:**
- Manages shopping cart items and quantities
- Persists cart in localStorage
- Provides cart operations via useCart() hook

---

## Menu Context (lib/menu-context.tsx)

See [COMPONENTS.md - MenuContext](../components/COMPONENTS.md#menucontext) for detailed documentation.

**Quick Summary:**
- Shares active category state
- Syncs sidebar and mobile menu selection
- Provides activeCategory and setActiveCategory via useMenu() hook

---

## Integration Guide

### Using Types

```typescript
import type { User, Product, MenuCategory } from "@/lib/types";
```

### Using Constants

```typescript
import { MENU_CATEGORIES, MOCK_PRODUCTS, SHOP_INFO } from "@/lib/constants";

// In a component:
const products = MOCK_PRODUCTS.filter(p => p.category === "cafe");
const shopName = SHOP_INFO.name;
```

### Using Auth Context

```typescript
import { useAuth } from "@/lib/auth-context";

export default function MyComponent() {
  const { user, login, logout } = useAuth();

  if (!user) return <p>Not logged in</p>;
  return <p>Welcome, {user.name}!</p>;
}
```

### Using Cart Context

```typescript
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <button onClick={() => addToCart(product)}>
      Add to Cart
    </button>
  );
}
```

### Using Menu Context

```typescript
import { useMenu } from "@/lib/menu-context";
import { MENU_CATEGORIES } from "@/lib/constants";

export default function CategoryFilter() {
  const { activeCategory, setActiveCategory } = useMenu();

  return (
    <div>
      {MENU_CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={activeCategory === cat.id ? "active" : ""}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
```

---

## Data Flow & Updates

### When to Update Constants
1. **Product List:** When adding/removing products
   - Update MOCK_PRODUCTS array
   - Or replace with API call in the future

2. **Categories:** When adding new product categories
   - Update MENU_CATEGORIES array
   - Update product category references

3. **Shop Info:** When shop details change
   - Update SHOP_INFO object
   - Automatically reflects in header/footer

4. **Social Links:** When social handles change
   - Update SOCIAL_LINKS object

### Future API Integration

When backend is ready:

```typescript
// Replace MOCK_PRODUCTS with:
const [products, setProducts] = useState<Product[]>([]);
useEffect(() => {
  fetch("/api/products")
    .then(r => r.json())
    .then(setProducts);
}, []);

// Replace MOCK_USERS with:
const login = async (username: string, password: string) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  return res.ok;
};
```

---

## Best Practices

1. **Import Types:** Always use `import type` for types to avoid runtime bloat
2. **Immutability:** Contexts return functions to update state, not direct mutations
3. **localStorage:** Keys are centralized (`coffee-shop-user`, `coffee-shop-cart`)
4. **Validation:** Contexts validate/sanitize data (e.g., filter invalid cart items)
5. **Default Values:** Contexts have sensible defaults (activeCategory: "all")
