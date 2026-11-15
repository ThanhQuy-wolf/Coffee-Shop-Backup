# Components

Components follow Atomic Design. Each component documents itself with JSDoc
(summary plus `@param props.x`), so hovering its name or a prop in the editor
shows the description. This file is the map.

## Layers

```
components/
+-- atoms/        # Smallest pieces, no app state (ATOMS.md)
+-- molecules/    # Small groups of atoms: cards, modal shell, search bar, bell
+-- organisms/    # Screen sections that read contexts or call services
+-- templates/    # Route group layouts and the role guard
```

A layer may only import from the layers above it in this list (an organism may
use molecules and atoms, never another template).

## Imports

- Atoms come from the layer barrel:
  `import { Button, Alert } from "@/components/atoms"`.
- Everything else comes from its folder index, never from a file inside it:
  `import { Modal, ModalHeader } from "@/components/molecules/modal"`,
  `import { ShiftCard } from "@/components/molecules/cards"`.
- Inside one folder, files import each other by relative path.
- There is no barrel for the whole molecules, organisms or templates layer, so
  one import does not pull in unrelated screens.

## Atoms

| Folder        | Exports                      | Use                                                                       |
| ------------- | ---------------------------- | ------------------------------------------------------------------------- |
| `buttons/`    | `Button`                     | Every button. Shape, colour and size presets, optional icon               |
| `feedback/`   | `Alert`, `Spinner`           | Error or notice box (`role="alert"`); loading indicator (`role="status"`) |
| `errors/`     | `ErrorMessageLogin`          | Form-level or field-level error on login and register                     |
| `inputs/`     | `LoginInput`, `Textarea`     | Login/register text field with password toggle; multi-line field          |
| `typography/` | `Heading`, `Text`, `Caption` | Text styles                                                               |

## Molecules

| Folder               | Exports                                         | Use                                                            |
| -------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| `cards/`             | `ProductCard`, `ShiftCard`, `SHIFT_VIEW_STYLES` | Menu card; shift card coloured by state                        |
| `empty-state/`       | `EmptyState`                                    | Icon, headline, hint and optional link for an empty list/page  |
| `modal/`             | `Modal`, `ModalHeader`                          | Dialog shell (Esc, backdrop, scroll lock, ARIA) and its header |
| `notification-bell/` | `NotificationBell`                              | Unread notifications (A-8, A-9)                                |
| `search-bar/`        | `SearchBar`                                     | Search field with clear button                                 |

## Organisms

| Folder            | Exports                                                                                                                             | Used by              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `analytics/`      | Charts (`LineChart`, `BarChart`, `PieChart`), sections, `useAnalytics`                                                              | `/manager/analytics` |
| `cart/`           | `CartFab`                                                                                                                           | `MainLayout`         |
| `forms/`          | `LoginForm`                                                                                                                         | `/login`             |
| `manager/`        | Tabs (`ProductsTab`, `CombosTab`, `CategoriesTab`, `ShopInfoTab`, `ReviewsTab`), their modals, `StatusBadge`, `DeleteConfirm`       | `/manager`           |
| `modals/`         | `ReviewModal`                                                                                                                       | `/orders/[orderId]`  |
| `navigation/`     | `CategorySidebar`, `MobileCategoryTabs`                                                                                             | `/`                  |
| `product-grid/`   | `ProductGrid`                                                                                                                       | `/`                  |
| `shift-schedule/` | `WeeklySchedule`, `MonthlyCalendar`, `MobileShiftView`, `ScheduleHeader`, `ScheduleSidebar`, `ShiftDetailModal`, `ShiftCreateModal` | `/staff/schedule`    |

## Templates

| Folder            | Export          | Use                                                 |
| ----------------- | --------------- | --------------------------------------------------- |
| `main-layout/`    | `MainLayout`    | `(main)` group: header, footer, cart button         |
| `staff-layout/`   | `StaffLayout`   | `(staff)` group, staff and manager only             |
| `manager-layout/` | `ManagerLayout` | `(manager)` group, manager only, mounts the catalog |
| `role-guard/`     | `RoleGuard`     | Wraps any page that needs a role (FR-04)            |

## Conventions

- Show a service error with `<Alert message={error} />` and a loading state with
  `<Spinner />`; do not hand-write the markup again.
- Format money with `formatVND`, `formatVNDShort` or `formatNumber` from
  `@/lib/utils/currency`, never with `toLocaleString`.
- Props types live in a `*.types.ts` file next to the component, or at the top
  of the component file when only that file uses them.
- Comments say why, or cite a rule (`BR-xx`, `UC-xx`). Do not label JSX blocks.
