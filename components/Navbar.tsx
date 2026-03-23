"use client";

import { MENU_CATEGORIES, SHOP_INFO } from "@/lib/constants";
import type { MenuCategory } from "@/lib/types";

interface NavbarProps {
  /** Whether the sidebar is expanded (true) or icon-only (false) */
  isOpen: boolean;
  /** Toggle expand / collapse */
  onToggle: () => void;
  /** Currently selected category id */
  activeCategory?: string;
  /** Fired when user clicks a category */
  onCategoryChange?: (id: string) => void;
}

/**
 * Left sidebar — always visible, collapsible on all screen sizes.
 *
 * Collapsed  → 64 px wide, icon only
 * Expanded   → 240 px wide, icon + label
 *
 * Width transition is handled by Tailwind w-16 / w-60 + transition-all.
 * Parent controls open/close state via isOpen + onToggle props.
 */
export default function Navbar({
  isOpen,
  onToggle,
  activeCategory = "all",
  onCategoryChange,
}: NavbarProps) {
  return (
    <aside
      className={`
        sticky shrink-0 flex-col z-20
        border-r border-(--color-border)
        bg-(--color-bg-sidebar)
        overflow-y-auto overflow-x-hidden
        transition-all duration-250 ease-in-out
        hidden md:flex
        xl:w-60
        ${isOpen ? "w-60" : "w-16"}
      `}
      style={{
        top: "var(--spacing-header-height)",
        height: "calc(100vh - var(--spacing-header-height))",
      } as React.CSSProperties}
    >
      {/* ── Sidebar header: title + toggle button ── */}
      <div
        className={`
          flex items-center border-b border-(--color-border) shrink-0
          xl:justify-between xl:px-4 xl:py-3
          ${isOpen ? "justify-between px-4 py-3" : "justify-center px-0 py-3"}
        `}
      >
        {/* Title — shown when expanded, always shown on xl+ */}
        <span
          className={`
            text-xs font-bold uppercase tracking-widest
            text-(--color-text-muted) whitespace-nowrap
            ${isOpen ? "block" : "hidden"} xl:block
          `}
        >
          <i className="fa-solid fa-utensils mr-2 text-(--color-primary)"></i>
          Thực Đơn
        </span>

        {/* Toggle button — hidden on xl+ (sidebar is always expanded there) */}
        <button
          onClick={onToggle}
          title={isOpen ? "Thu gọn menu" : "Mở rộng menu"}
          className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer border-none
                     text-(--color-text-muted) bg-transparent
                     hover:bg-(--color-border-light) hover:text-(--color-primary)
                     transition-colors duration-150 shrink-0 xl:hidden"
        >
          <i
            className={`fa-solid text-sm transition-transform duration-250 ${
              isOpen ? "fa-chevron-left" : "fa-chevron-right"
            }`}
          ></i>
        </button>
      </div>

      {/* ── Category list ── */}
      <nav className="flex-1 py-2">
        <ul className="flex flex-col gap-0.5 px-2">
          {MENU_CATEGORIES.map((cat: MenuCategory) => {
            const isActive = activeCategory === cat.id;
            return (
              <li key={cat.id}>
                <button
                  onClick={() => onCategoryChange?.(cat.id)}
                  title={!isOpen ? cat.name : undefined}
                  className={`
                    w-full flex items-center rounded-xl text-sm font-medium
                    cursor-pointer border-none transition-all duration-150
                    xl:gap-3 xl:px-3 xl:py-2.5 xl:justify-start
                    ${isOpen ? "gap-3 px-3 py-2.5" : "justify-center px-0 py-2.5"}
                    ${
                      isActive
                        ? "bg-(--color-primary) text-white shadow-sm"
                        : "bg-transparent text-(--color-text-secondary) hover:bg-(--color-border-light) hover:text-(--color-primary-dark)"
                    }
                  `}
                >
                  {/* Icon */}
                  <i
                    className={`
                      ${cat.icon} w-5 text-center text-base shrink-0
                      ${isActive ? "text-white" : "text-(--color-primary)"}
                    `}
                  ></i>

                  {/* Label — hidden when collapsed, always shown on xl+ */}
                  <span
                    className={`
                      whitespace-nowrap overflow-hidden text-ellipsis
                      ${isOpen ? "block" : "hidden"} xl:block
                    `}
                  >
                    {cat.name}
                  </span>

                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Sidebar footer: opening hours ── */}
      <div
        className={`
          shrink-0 border-t border-(--color-border) py-3
          xl:px-4
          ${isOpen ? "px-4" : "px-0 flex justify-center"}
        `}
      >
        {/* Text row — shown when expanded, always shown on xl+ */}
        <div
          className={`
            items-center gap-2 text-xs text-(--color-text-muted)
            ${isOpen ? "flex" : "hidden"} xl:flex
          `}
        >
          <i className="fa-solid fa-clock text-(--color-accent) shrink-0"></i>
          <span>{SHOP_INFO.openHours}</span>
        </div>

        {/* Icon-only — shown when collapsed, hidden on xl+ */}
        <span className="xl:hidden">
          <i
            className={`
              fa-solid fa-clock text-sm text-(--color-text-muted)
              ${isOpen ? "hidden" : "block"}`}
            title={SHOP_INFO.openHours}
          ></i>
        </span>
      </div>
    </aside>
  );
}
