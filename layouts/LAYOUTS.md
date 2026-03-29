# Layouts Documentation

> Tài liệu chi tiết về layout components (Header, Footer) và responsive behavior

---

## Overview

The `layouts/` directory contains layout-level components used across all pages. These are included in the root layout and provide consistent header/footer across the application.

```
layouts/
├── header.tsx      # Sticky top header with shop branding and auth
├── footer.tsx      # Footer with shop info, social links, WiFi details
└── LAYOUTS.md     # (this file)
```

---

## Header (layouts/header.tsx)

**File:** layouts/header.tsx
**Type:** Client component
**Description:** Sticky top navigation bar with brand info and authentication status display.

### Layout

```
┌─────────────────────────────────────────────────────┐
│  [Logo] [Shop Name] [Tagline]  │  [Auth Status]    │
└─────────────────────────────────────────────────────┘
height: 72px (var(--spacing-header-height))
```

**2-Column Layout:**
- **Left:** Shop branding (logo + name + tagline)
- **Right:** Auth status indicator

### Features

#### Logo & Branding
- Shop logo (40x40px)
- Shop name (bold text)
- Tagline (hidden on mobile < md, visible md+)

**Responsive:**
| Breakpoint | Logo | Name | Tagline |
|-----------|------|------|---------|
| < sm (640px) | Yes | Yes | Hidden |
| sm-md | Yes | Yes | Hidden |
| md+ (768px) | Yes | Yes | Visible |

#### Authentication Status

The header cycles through 3 auth states (for UI demo):

**State 1: Guest (Not logged in)**
```
[brown button] "Dang nhap"
```
- Guest state (user = null)
- Brown primary button
- Click: toggles to next state

**State 2: Manager**
```
[caramel/gold badge] "👔 Quản lý"
```
- Shows manager role
- Gold/caramel colored badge
- User tie icon
- Name: Nguyễn Văn An

**State 3: Staff**
```
[border button] "👤 [Name]"
```
- Shows staff role with avatar placeholder
- Bordered button style
- Name: Trần Thị Bình
- Click: toggles back to Guest state

### Responsive Behavior

| Breakpoint | Layout |
|-----------|--------|
| < sm | Stacked vertically |
| sm-md (640px) | Side-by-side, reduced spacing |
| md+ (768px) | Full width, comfortable spacing |

**Mobile (<640px):**
- Logo smaller
- Name only (no tagline)
- Auth button text hidden, icon shown
- Touch-friendly padding

**Desktop (≥640px):**
- Normal logo size
- Full layout with tagline
- Button with text and icon
- Comfortable spacing

### Styling

| Element | Classes |
|---------|---------|
| Header wrapper | `sticky top-0 z-50 bg-white shadow-md` |
| Container | `max-w-7xl mx-auto px-4 md:px-6 h-72px flex items-center` |
| Left section (brand) | `flex items-center gap-3 flex-1` |
| Right section (auth) | `flex items-center gap-3 shrink-0` |
| Logo image | `w-10 h-10 md:w-12 md:h-12` |
| Brand text | `font-bold text-sm md:text-base` |
| Tagline | `hidden md:block text-xs text-muted-foreground` |
| Auth button | `px-4 py-2 rounded-lg text-sm font-medium` |

### CSS Variables Used

```css
--spacing-header-height: 72px;
--color-primary: brown;
--color-primary-dark: darker brown;
--color-text-primary: text color;
--color-text-muted: gray text;
--color-shadow-sm: subtle shadow;
```

### Dependencies

- **next/image** - Logo image rendering
- **next/link** - Navigation links
- **lib/constants:** SHOP_INFO, MOCK_USERS
- **lib/types:** User
- **FontAwesome icons:** fa-sign-in-alt, fa-sign-out-alt, fa-user-tie, fa-user-circle

### Key Code Snippets

**Auth Demo State Machine:**
```typescript
const [user, setUser] = useState<User | null>(null);

const handleAuthClick = () => {
  if (!user) {
    setUser(MOCK_USERS.manager);
  } else if (user.role === "manager") {
    setUser(MOCK_USERS.staff);
  } else {
    setUser(null);
  }
};
```

**Responsive Brand Text:**
```typescript
<div className="flex flex-col">
  <span className="font-bold text-sm md:text-base">{SHOP_INFO.name}</span>
  <span className="hidden md:block text-xs text-muted-foreground">
    {SHOP_INFO.tagline}
  </span>
</div>
```

---

## Footer (layouts/footer.tsx)

**File:** layouts/footer.tsx
**Type:** Client component (uses constants)
**Description:** Site footer with shop information, social links, and WiFi details.

### Layout

```
┌────────────────────────────────────────────┐
│  [Brand Info]  │  [Social + WiFi]          │
├────────────────────────────────────────────┤
│  © 2024 Coffee Shop. Made with ❤️ in VN   │
└────────────────────────────────────────────┘
```

**12-Column Grid Layout:**

| Breakpoint | Brand Info | Social + WiFi |
|-----------|-----------|---------------|
| Mobile | col-span-12 | col-span-12 |
| md (768px) | col-span-6 | col-span-6 |
| lg+ (1024px) | col-span-6 | col-span-6 |

### Sections

#### 1. Brand Info (Left Section)

**Content:**
- Shop logo (40x40px)
- Shop name (bold)
- Tagline (gray text)
- Address with location icon
- Phone with phone icon
- Email with envelope icon
- Open hours with clock icon

**Responsive:**
```
Mobile:
└─ Logo
└─ Name & Tagline (stacked)
└─ Address
└─ Phone
└─ Email
└─ Open Hours

Desktop:
└─ Logo + Name/Tagline (flexbox, side-by-side)
└─ Address, Phone, Email, Hours (stacked below)
```

#### 2. Social Links (Top Right)

**Links:**
- Facebook icon → SHOP_INFO.facebook
- TikTok icon → SHOP_INFO.tiktok
- Website icon → SHOP_INFO.website

**Styling:**
- Icons in circle backgrounds
- Hover effect (color change)
- Flex row layout
- Centered alignment

#### 3. WiFi Card (Bottom Right)

**Content:**
- "📶 WiFi miễn phí" label
- Network name (monospace)
- Password (monospace, can be hidden/shown)

**Styling:**
- Light gray background
- Rounded borders
- Monospace font for credentials
- Eye icon toggle for password visibility

**Example:**
```
📶 WiFi miễn phí
┌────────────────────────┐
│ Network: CoffeeShop    │
│ Password: ••••••••     │
│           (eye icon)   │
└────────────────────────┘
```

#### 4. Copyright Bar (Bottom)

**Content:**
- Copyright text: "© 2024 Coffee Shop"
- "Made with ❤️ in Vietnam"
- Centered

**Styling:**
- Small text
- Gray color
- Subtle separator line above

### Responsive Behavior

**Mobile (<768px):**
- Single column layout
- Stacked sections
- Full width
- Padding around edges

**Tablet (768px):**
- 2-column layout
- Brand info left, Social + WiFi right
- Equal width columns

**Desktop (≥768px):**
- 2-column layout with more spacing
- Brand info slightly smaller
- Comfortable padding

### Styling

| Element | Classes |
|---------|---------|
| Footer wrapper | `bg-gray-100 border-t` |
| Container | `max-w-7xl mx-auto px-4 py-8` |
| Grid | `grid grid-cols-12 gap-8` |
| Brand section | `col-span-12 md:col-span-6` |
| Social section | `col-span-12 md:col-span-6` |
| Logo | `w-10 h-10` |
| Info text | `text-sm text-gray-600` |
| Social icons | `w-10 h-10 rounded-full flex items-center justify-center` |
| WiFi card | `bg-white p-4 rounded-lg border` |
| Copyright bar | `border-t mt-8 pt-6 text-center text-xs text-gray-500` |

### CSS Variables Used

```css
--color-primary: brand color;
--color-text-secondary: secondary text color;
--color-text-muted: muted/gray text color;
--color-accent: accent color;
--color-border: border color;
--color-bg-*: background colors;
--color-shadow-sm: subtle shadow;
```

### Dependencies

- **next/image** - Shop logo
- **next/link** - Social links
- **lib/constants:** SHOP_INFO, SOCIAL_LINKS
- **FontAwesome icons:** location-dot, phone, envelope, clock, facebook, tiktok, globe, wifi, eye, eye-slash

### Key Code Snippets

**Brand Info Section:**
```typescript
<div className="flex gap-4">
  <Image src={SHOP_INFO.logo} alt={SHOP_INFO.name} width={40} height={40} />
  <div>
    <h3 className="font-bold">{SHOP_INFO.name}</h3>
    <p className="text-sm text-muted-foreground">{SHOP_INFO.tagline}</p>
    <p className="text-sm mt-2">{SHOP_INFO.address}</p>
    {/* etc */}
  </div>
</div>
```

**Social Links:**
```typescript
<div className="flex gap-3">
  <Link href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener">
    <i className="fab fa-facebook" />
  </Link>
  {/* etc */}
</div>
```

**WiFi Display:**
```typescript
<div className="bg-white p-4 rounded-lg">
  <p className="font-semibold text-sm">📶 WiFi miễn phí</p>
  <p className="font-mono text-xs mt-2">{SHOP_INFO.wifi.name}</p>
  <p className="font-mono text-xs">
    {showPassword ? SHOP_INFO.wifi.password : "••••••••"}
  </p>
</div>
```

---

## Integration in Root Layout

**File:** app/layout.tsx

```typescript
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

**Result:**
- Header: Always at top (sticky)
- Content: Takes full width between header/footer
- Footer: Always at bottom

---

## Responsive Design Patterns

### Header Responsive Pattern

```css
/* Mobile first */
.header {
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

/* Tablet+ */
@media (min-width: 640px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
    padding: 1.5rem;
  }
}

/* Desktop+ */
@media (min-width: 768px) {
  .header {
    padding: 2rem;
  }

  .tagline {
    display: block; /* Show tagline on desktop */
  }
}
```

### Footer Responsive Pattern

```css
/* Mobile: stacked */
.footer-grid {
  grid-template-columns: 1fr;
}

/* Tablet: 2 columns */
@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}
```

---

## Dark Mode Support

CSS variables are set up for dark mode support. To enable:

1. Add dark mode CSS variable overrides:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-main: #1a1a1a;
    --color-text-primary: #ffffff;
    /* etc */
  }
}
```

2. Or use Tailwind dark class:

```html
<div className="dark:bg-gray-900 dark:text-white">
  Content
</div>
```

---

## Accessibility

### Header
- Logo has alt text
- Auth button has aria-label
- Icons have semantic meaning
- Good contrast ratios

### Footer
- Headings use semantic tags
- Links have descriptive text
- Icons are decorative (aria-hidden)
- Monospace font for technical info (WiFi credentials)

### General
- Touch targets ≥ 48px on mobile
- Sufficient color contrast
- Semantic HTML structure
- ARIA labels where needed

---

## Best Practices

1. **Keep layouts simple:** Avoid complex nested layouts
2. **Responsive first:** Use mobile-first CSS approach
3. **Reuse components:** Use Header/Footer across all pages
4. **Props over hardcoding:** Use lib/constants for data
5. **Type safety:** Use TypeScript for component props
6. **Performance:** Optimize images with next/image
7. **Accessibility:** Add ARIA labels and semantic HTML
