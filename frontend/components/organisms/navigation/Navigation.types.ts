export interface CategorySidebarProps {
  /** Whether the sidebar is expanded (true) or icon-only (false) */
  isOpen: boolean;
  onToggle: () => void;
  openHours: string;
}
