# Coffee Shop Frontend - TODO

## Completed Features & Implementations

### A. Dead Code Removed

- [x] lib/constants.ts - Removed unused NAV_LINKS export
- [x] lib/types.ts - Removed unused NavLink interface
- [x] components/Navbar.tsx - Removed trivial handleClick wrapper; inlined
      onCategoryChange call
- [x] components/Navbar.tsx - Removed unused Link import

### B. Bugs / Inaccuracies Fixed

- [x] layouts/header.tsx - Fixed JSDoc: 3-column -> 2-column layout (no center
      section exists)
- [x] app/page.tsx - Added available !== false filter to product list
- [x] app/page.tsx - Fixed setState-in-effect lint error: moved initial sidebar
      state to lazy useState initializer
- [x] next.config.ts - Added explanatory JSDoc comment

### C. Documentation Updated

- [x] README.md - Fixed file structure tree, removed SCSS, fixed dark mode note,
      updated tech table
- [x] components/COMPONENTS.md - Fixed CartProduct styling (was outdated
      w-64/text-red-500/bg-blue-600); added Navbar, Header, Footer sections

### D. New Documentation Created

- [x] WORKFLOW.md - Architecture, data flow, design token system, how-to guides,
      dev workflow

### E. Mini-test Results

- [x] npm run lint - PASSED (0 errors, 0 warnings)
- [x] npm run build - PASSED (Compiled successfully, TypeScript clean, static
      pages generated)

---

## Pending Features (Future Work)

### Cart & Ordering
- [ ] Implement cart checkout flow (app/(main)/cart or modal)
- [ ] Cart sidebar/modal with item list and total
- [ ] Order submission API integration
- [ ] Payment page implementation (app/(main)/payment)
- [ ] Order history/tracking page
- [ ] Toast notifications for cart actions

### Authentication & User Management
- [ ] Real backend authentication (replace MOCK_AUTH_DB)
- [ ] Real OTP delivery service (SMS integration)
- [ ] User profile page with edit capability
- [ ] Password reset/recovery flow
- [ ] Session management and token refresh

### Manager Features
- [ ] Manager dashboard page (app/(manager)/page.tsx)
- [ ] Product management (add/edit/delete)
- [ ] Category management
- [ ] Order management & tracking
- [ ] Sales analytics/dashboard
- [ ] Inventory management

### Backend Integration
- [ ] Replace MOCK_PRODUCTS with API calls (GET /api/products)
- [ ] Replace MOCK_SHOPS with API calls (GET /api/shops)
- [ ] Replace MOCK_USERS with real authentication (POST /api/auth/login)
- [ ] Real product images (replace placeholder.jpg)
- [ ] Image upload for products

### UX Improvements
- [ ] Dark mode toggle (CSS variables prepared, toggle UI needed)
- [ ] Loading skeletons for product grid
- [ ] Product detail modal/page with full description
- [ ] Wishlist/favorites feature
- [ ] Sort products (price, rating, etc.)
- [ ] Filter by price range
- [ ] Quantity selector in product card
- [ ] Related products suggestions

### Performance & SEO
- [ ] Dynamic route generation for products (app/(main)/product/[id]/page.tsx)
- [ ] Dynamic route generation for shops (app/(feed)/shop/[id]/page.tsx)
- [ ] Meta tags and Open Graph for SEO
- [ ] Image optimization and lazy loading
- [ ] Code splitting and dynamic imports

### Accessibility & Testing
- [ ] Keyboard navigation testing
- [ ] ARIA labels audit
- [ ] Unit tests for contexts
- [ ] E2E tests for user flows
- [ ] Accessibility audit (WCAG 2.1 AA)
