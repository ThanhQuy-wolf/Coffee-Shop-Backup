/**
 * Classes for a category button in the sidebar or the mobile tabs.
 * @param isActive Whether it is the selected category.
 */
export function categoryButtonClass(isActive: boolean): string {
  return isActive
    ? "bg-(--color-primary) text-white shadow-sm"
    : "bg-transparent text-(--color-text-secondary) hover:bg-(--color-border-light) hover:text-(--color-primary-dark)";
}

/**
 * Classes for the icon inside a category button.
 * @param isActive Whether it is the selected category.
 */
export function categoryIconClass(isActive: boolean): string {
  return isActive ? "text-white" : "text-(--color-primary)";
}
