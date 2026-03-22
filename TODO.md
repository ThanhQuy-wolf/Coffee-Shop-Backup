# Coffee Shop Frontend - TODO

## Completed Optimizations

### A. Dead Code Removed
- [x] lib/constants.ts - Removed unused NAV_LINKS export
- [x] lib/types.ts - Removed unused NavLink interface
- [x] components/Navbar.tsx - Removed trivial handleClick wrapper; inlined onCategoryChange call
- [x] components/Navbar.tsx - Removed unused Link import

### B. Bugs / Inaccuracies Fixed
- [x] layouts/header.tsx - Fixed JSDoc: 3-column -> 2-column layout (no center section exists)
- [x] app/page.tsx - Added available !== false filter to product list
- [x] app/page.tsx - Fixed setState-in-effect lint error: moved initial sidebar state to lazy useState initializer
- [x] next.config.ts - Added explanatory JSDoc comment

### C. Documentation Updated
- [x] README.md - Fixed file structure tree, removed SCSS, fixed dark mode note, updated tech table
- [x] components/COMPONENTS.md - Fixed CartProduct styling (was outdated w-64/text-red-500/bg-blue-600); added Navbar, Header, Footer sections

### D. New Documentation Created
- [x] WORKFLOW.md - Architecture, data flow, design token system, how-to guides, dev workflow

### E. Mini-test Results
- [x] npm run lint - PASSED (0 errors, 0 warnings)
- [x] npm run build - PASSED (Compiled successfully, TypeScript clean, static pages generated)

---

## Pending Features (Future Work)

### Cart & Ordering
- [ ] Implement add-to-cart logic (onBuy callback in CartProduct)
- [ ] Cart sidebar or modal with item list and total
- [ ] Order submission flow
- [ ] Payment page

### Backend Integration
- [ ] Replace MOCK_PRODUCTS with real API calls (lib/api.ts)
- [ ] Replace MOCK_USERS with real authentication
- [ ] Product images: replace placeholder with real images in public/imgs/products/

### Manager Page
- [ ] Create app/manager/page.tsx
- [ ] Menu management (add/edit/delete products)
- [ ] Order tracking dashboard

### UX Improvements
- [ ] Dark mode toggle (CSS variables already prepared in globals.css)
- [ ] Loading skeleton for product grid
- [ ] Toast notifications for cart actions
- [ ] Product detail modal/page
