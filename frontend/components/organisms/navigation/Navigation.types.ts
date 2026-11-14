export interface CategorySidebarProps {
  /** Whether the sidebar is expanded (true) or icon-only (false). */
  isOpen: boolean;
  onToggle: () => void;
  /** Opening hours shown at the bottom. */
  openHours: string;
}
