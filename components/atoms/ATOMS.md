# Atoms Components Library

**Status:** ✅ Phase 1 Implementation Complete **Created:** 2026-04-03
**Foundation:** Atomic Design Pattern

---

## 📚 Overview

Atoms are the basic building blocks of your UI. They are small, focused,
reusable components that have no dependencies on other components (except
potentially other atoms).

**Key Principles:**

- ✅ No business logic
- ✅ No context/hooks (useAuth, useCart, etc.)
- ✅ Pure props-based
- ✅ Full TypeScript typing
- ✅ CSS variables for theming
- ✅ Accessible by default

---

## 🎯 Atoms Created

### Buttons (`buttons/`)

#### **Button.tsx**

Main interactive button component with multiple variants and sizes.

**Props:**

- `variant` - "primary" | "secondary" | "danger" | "ghost" (default: "primary")
- `size` - "sm" | "md" | "lg" (default: "md")
- `icon` - FontAwesome icon class (optional)
- `iconPosition` - "left" | "right" (default: "left")
- `disabled` - boolean
- `children` - ReactNode
- `className` - string (for custom overrides)
- All standard HTML button attributes

**Usage:**
```tsx
import { Button } from "@/components/atoms";

<Button variant="primary" size="sm" icon="fa-cart-plus">
  Mua
</Button>

<Button variant="secondary" onClick={handleClick}>
  Cancel
</Button>

<Button variant="danger" disabled>
  Delete
</Button>
```

**Styling:**
- Primary: Branded color with dark hover
- Secondary: Border style with light background on hover
- Danger: Red for destructive actions
- Ghost: Transparent with light background on hover

---

#### **IconButton.tsx**

Button designed specifically for icon-only interactions.

**Props:**

- `variant` - "primary" | "secondary" | "danger" | "ghost"
- `size` - "sm" (8x8) | "md" (10x10) | "lg" (12x12)
- `icon` - FontAwesome icon class (required)
- All standard HTML button attributes

**Usage:**
```tsx
import { IconButton } from "@/components/atoms";

<IconButton icon="fa-close" size="md" variant="secondary" />
<IconButton icon="fa-menu" onClick={toggleMenu} />
```

---

### Inputs (`inputs/`)

#### **TextInput.tsx**

General text input field with optional label, error, and icon.

**Props:**

- `label` - string (optional)
- `error` - string (optional, shows red border and error text)
- `icon` - FontAwesome icon class (optional)
- `onIconClick` - callback when icon is clicked
- All standard HTML input attributes

**Usage:**
```tsx
import { TextInput } from "@/components/atoms";

<TextInput
  label="Email"
  placeholder="user@example.com"
  type="email"
/>

<TextInput
  label="Password"
  type="password"
  error="Password too short"
  icon="fa-eye"
  onIconClick={togglePasswordVisibility}
/>
```

---

#### **SearchInput.tsx**

Search input with built-in search icon and clear button.

**Props:**

- `value` - string (controlled input)
- `onChange` - callback when text changes
- `onClear` - callback for clear button (required for button to show)
- `placeholder` - string
- All standard HTML input attributes

**Usage:**
```tsx
import { SearchInput } from "@/components/atoms";

const [query, setQuery] = useState("");

<SearchInput
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery("")}
  placeholder="Search products..."
/>;
```

---

#### **Textarea.tsx**

Multi-line text input with optional label and error.

**Props:**

- `label` - string (optional)
- `error` - string (optional)
- All standard HTML textarea attributes

**Usage:**
```tsx
import { Textarea } from "@/components/atoms";

<Textarea
  label="Comments"
  placeholder="Enter your feedback..."
  rows={4}
  value={review}
  onChange={(e) => setReview(e.target.value)}
/>;
```

---

### Typography (`typography/`)

#### **Heading.tsx**

Semantic heading component with level-based sizing.

**Props:**

- `level` - 1 | 2 | 3 | 4 | 5 | 6 (default: 2)
- `children` - ReactNode
- All standard HTML heading attributes

**Sizing:**
- Level 1: text-3xl font-bold
- Level 2: text-2xl font-bold
- Level 3: text-xl font-bold
- Level 4: text-lg font-semibold
- Level 5: text-base font-semibold
- Level 6: text-sm font-semibold

**Usage:**
```tsx
import { Heading } from "@/components/atoms";

<Heading level={1}>Page Title</Heading>
<Heading level={2}>Section</Heading>
<Heading level={3}>Subsection</Heading>
```

---

#### **Text.tsx**

Paragraph text with semantic variants.

**Props:**

- `variant` - "body1" | "body2" | "caption" | "label" (default: "body1")
- `children` - ReactNode
- All standard HTML paragraph attributes

**Variants:**
- body1: text-base (main content)
- body2: text-sm (secondary content)
- caption: text-xs (smallest text)
- label: text-sm font-medium (form labels)

**Usage:**
```tsx
import { Text } from "@/components/atoms";

<Text variant="body1">Main content paragraph</Text>
<Text variant="body2">Secondary information</Text>
<Text variant="caption">Small fine print</Text>
<Text variant="label">Form label text</Text>
```

---

#### **Caption.tsx**

Small caption/note text component.

**Props:**

- `children` - ReactNode
- All standard HTML span attributes

**Usage:**
```tsx
import { Caption } from "@/components/atoms";

<Caption>Last updated 2 hours ago</Caption>
<Caption>* Required field</Caption>
```

---

### Badges (`badges/`)

#### **Badge.tsx**

Labeled badge component for highlighting information.

**Props:**

- `variant` - "primary" | "secondary" | "success" | "danger" | "warning"
  (default: "primary")
- `size` - "sm" | "md" (default: "md")
- `children` - ReactNode
- All standard HTML span attributes

**Variants:**
- primary: Branded color
- secondary: Light gray
- success: Green
- danger: Red
- warning: Yellow

**Usage:**
```tsx
import { Badge } from "@/components/atoms";

<Badge variant="primary">New</Badge>
<Badge variant="success" size="sm">Active</Badge>
<Badge variant="danger">Expired</Badge>
```

---

#### **PriceBadge.tsx**

Specialized badge for displaying formatted prices.

**Props:**

- `price` - number
- `currency` - string (default: "VND")
- All standard HTML span attributes

**Usage:**
```tsx
import { PriceBadge } from "@/components/atoms";

<PriceBadge price={50000} />
<PriceBadge price={99.99} currency="USD" />
```

**Output:**
- VND: "50.000 ₫"
- USD: "$99.99"

---

### Dividers (`dividers/`)

#### **Divider.tsx**

Visual separator element.

**Props:**

- `orientation` - "horizontal" | "vertical" (default: "horizontal")
- All standard HTML hr attributes

**Usage:**
```tsx
import { Divider } from "@/components/atoms";

<Divider /> {/* Horizontal line */}
<Divider orientation="vertical" className="h-12" />
```

---

## 🎨 Theming

All atoms use CSS variables for consistent theming:

```css
/* Colors */
--color-primary
--color-primary-dark
--color-accent
--color-accent-light
--color-bg-card
--color-text-primary
--color-text-secondary
--color-text-muted
--color-border
--color-border-light
--color-shadow-sm
--color-shadow-md
```

Change one variable in `globals.css` to update all atoms across the app.

---

## 🔄 Import Patterns

### Individual Imports

```tsx
import { Badge, PriceBadge } from "@/components/atoms/badges";
import { Button } from "@/components/atoms/buttons";
import { Divider } from "@/components/atoms/dividers";
import { SearchInput, TextInput } from "@/components/atoms/inputs";
import { Caption, Heading, Text } from "@/components/atoms/typography";
```

### Barrel Exports (Recommended)

```tsx
import {
  Badge,
  Button,
  Caption,
  Divider,
  Heading,
  IconButton,
  PriceBadge,
  SearchInput,
  Text,
  TextInput,
  Textarea,
} from "@/components/atoms";
```

### Type Imports

```tsx
import type {
  ButtonProps,
  HeadingProps,
  TextInputProps,
} from "@/components/atoms";
```

---

## ✅ Usage Examples

### Form Field

```tsx
<div className="space-y-4">
  <TextInput label="Name" placeholder="Enter your name" type="text" />
  <TextInput
    label="Email"
    placeholder="user@example.com"
    type="email"
    error={emailError}
  />
  <Button type="submit">Submit</Button>
</div>
```

### Product Card
```tsx
<div className="rounded-lg border p-4">
  <Heading level={3}>Product Name</Heading>
  <Text variant="body2">Product description</Text>
  <div className="mt-4 flex items-center justify-between">
    <PriceBadge price={50000} />
    <Button icon="fa-cart-plus">Add to Cart</Button>
  </div>
</div>
```

### Rating Display
```tsx
<div>
  <Heading level={4}>Reviews</Heading>
  <Text variant="body1">⭐⭐⭐⭐⭐ 4.5/5</Text>
  <Caption>Based on 128 reviews</Caption>
</div>
```

---

## 🧪 Testing Atoms

### Props Validation
```tsx
// ✅ Valid
<Button variant="primary" size="sm">Click</Button>

// ❌ Invalid (TypeScript will catch)
<Button variant="invalid">Click</Button>
<Button size={10}>Click</Button>
```

### Accessibility

All atoms include:

- Semantic HTML
- ARIA labels where appropriate
- Keyboard navigation support
- Focus visible states
- Color contrast compliance

---

## 📊 File Structure

```
components/atoms/
├── buttons/
│   ├── Button.tsx
│   ├── Button.types.ts
│   ├── IconButton.tsx
│   └── index.ts
├── inputs/
│   ├── TextInput.tsx
│   ├── SearchInput.tsx
│   ├── Textarea.tsx
│   ├── Input.types.ts
│   └── index.ts
├── typography/
│   ├── Heading.tsx
│   ├── Text.tsx
│   ├── Caption.tsx
│   ├── Typography.types.ts
│   └── index.ts
├── badges/
│   ├── Badge.tsx
│   ├── Badge.types.ts
│   ├── PriceBadge.tsx
│   └── index.ts
├── dividers/
│   ├── Divider.tsx
│   └── index.ts
├── index.ts (barrel export)
└── ATOMS.md (this file)
```

---

## 🚀 Next Steps

Once atoms are comfortable, the next phase is creating **Molecules** -
combinations of atoms:

- **ProductCard** - Image + Text + Badge + Button
- **FormField** - Label + Input + Error Text
- **SearchBar** - SearchInput + Button
- **RatingInput** - Interactive 5-star rating
- **PriceTag** - Price display with formatting
- And more...

See `OPTIMIZATION_PLAN.md` for the full roadmap.

---

## 📝 Notes

- All atoms use TypeScript for type safety
- No business logic in atoms - they're purely presentational
- Components are optimized for reusability
- Styling uses Tailwind + CSS variables for consistency
- Accessibility is built-in by default

---

**Status:** ✅ Complete & Ready for Use **Last Updated:** 2026-04-03 **Phase:**
1 of 5
