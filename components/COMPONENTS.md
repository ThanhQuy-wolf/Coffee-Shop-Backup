# Components Documentation

> **BlackBox AI Rule:**
> Whenever you create a new component in the components/ directory, or when the user asks to save a component to this file, **automatically append a new section** following the template below. Fill in all fields based on the component source code — props/interface, default values, types, usage example, and notes. Do not skip any field; if a value is unknown, write N/A.

---

## Component Template (for BlackBox AI)

Use this template when adding a new component entry:



---

## CartProduct

**File:** components/CartProduct.tsx
**Description:** A product card component that displays a product image, formatted price, a Mua (Buy) button, and a short description. Designed for use in shopping cart or product listing UIs.

### Props / Interface

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| image | string | yes | — | URL or path to the product image (used with Next.js Image). |
| imageAlt | string | no | Product image | Alt text for the product image (accessibility). |
| price | number or string | yes | — | Product price. If number, auto-formatted to Vietnamese Dong (VND). If string, rendered as-is. |
| description | string | yes | — | Short product description shown in the card footer. Clamped to 2 lines. |
| onBuy | () => void | no | undefined | Callback fired when the Mua button is clicked. |

### Internal Logic

- formattedPrice: If price is a number, it is formatted using toLocaleString(vi-VN, { style: currency, currency: VND }). If price is already a string, it is rendered directly.

### CSS / Styling Notes

| Element | Tailwind Classes | Purpose |
|---------|-----------------|---------|
| Card wrapper | flex flex-col w-64 rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-white hover:shadow-lg transition-shadow duration-300 | Outer card with hover shadow |
| Image container | relative w-full h-48 bg-gray-100 | Fixed-height image area |
| Price text | text-lg font-bold text-red-500 | Highlighted price in red |
| Buy button | bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer | Primary action button |
| Description area | px-4 py-3 border-t border-gray-100 bg-gray-50 | Footer section with light background |
| Description text | text-sm text-gray-600 leading-relaxed line-clamp-2 | Truncated 2-line description |

### Dependencies

- next/image — Next.js optimized Image component
- Tailwind CSS — utility-first CSS framework

### Usage Example



### Notes

- Card width is fixed at w-64 (256px). Adjust if a responsive layout is needed.
- The description is clamped to 2 lines via line-clamp-2; longer text will be truncated with ellipsis.
- If onBuy is not provided, the button renders but does nothing on click.
- Price formatting uses Vietnamese locale (vi-VN) and VND currency by default when price is a number.
