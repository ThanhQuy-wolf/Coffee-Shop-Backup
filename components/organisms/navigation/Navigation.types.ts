export interface CategorySidebarProps {
  /** Whether the sidebar is expanded (true) or icon-only (false) */
  isOpen: boolean;
  /** Toggle expand / collapse */
  onToggle: () => void;
  /** Currently selected category id */
  activeCategory?: string;
  /** Fired when user clicks a category */
  onCategoryChange?: (id: string) => void;
}
