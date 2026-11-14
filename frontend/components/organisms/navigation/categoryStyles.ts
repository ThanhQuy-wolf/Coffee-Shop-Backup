/** Shared active/inactive styles for category buttons (sidebar + mobile tabs). */
export function categoryButtonClass(isActive: boolean): string {
  return isActive
    ? "bg-(--color-primary) text-white shadow-sm"
    : "bg-transparent text-(--color-text-secondary) hover:bg-(--color-border-light) hover:text-(--color-primary-dark)";
}

export function categoryIconClass(isActive: boolean): string {
  return isActive ? "text-white" : "text-(--color-primary)";
}
