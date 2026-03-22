"use client";

import Link from "next/link";
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
  const handleClick = (id: string) => {
    onCategoryChange?.(id);
  };

  return (
    <aside
      className={`
        sticky shrink-0 flex flex-col z-20
        border-r border-[var(--color-border)]
        bg-[var(--color-bg-sidebar)]
        overflow-y-auto overflow-x-hidden
        transition-all duration-[250ms] ease-in-out
        ${isOpen ? "w-60" : "w-16"}
      `}
      style={{
        top: "var(--spacing-header-height)",
        height: "calc(100vh - var(--spacing-header-height))",
      }}
    >
      {/* ── Sidebar header: title + toggle button ── */}
      <div
        className={`
          flex items-center border-b border-[var(--color-border)] shrink-0
          ${isOpen ? "justify-between px-4 py-3" : "justify-center px-0 py-3"}
        `}
      >
        {isOpen && (
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] whitespace-nowrap">
            <i className="fa-solid fa-utensils mr-2 text-[var(--color-primary)]"></i>
            Thực Đơn
          </span>
        )}
        <button
          onClick={onToggle}
          title={isOpen ? "Thu gọn menu" : "Mở rộng menu"}
          className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer border-none
                     text-[var(--color-text-muted)] bg-transparent
                     hover:bg-[var(--color-border-light)] hover:text-[var(--color-primary)]
                     transition-colors duration-150 shrink-0"
        >
          <i
            className={`fa-solid text-sm transition-transform duration-[250ms] ${
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
                  onClick={() => handleClick(cat.id)}
                  title={!isOpen ? cat.name : undefined}
                  className={`
                    w-full flex items-center rounded-xl text-sm font-medium
                    cursor-pointer border-none transition-all duration-150
                    ${isOpen ? "gap-3 px-3 py-2.5" : "justify-center px-0 py-2.5"}
                    ${
                      isActive
                        ? "bg-[var(--color-primary)] text-white shadow-sm"
                        : "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)] hover:text-[var(--color-primary-dark)]"
                    }
                  `}
                >
                  {/* Icon */}
                  <i
                    className={`
                      ${cat.icon} w-5 text-center text-base shrink-0
                      ${isActive ? "text-white" : "text-[var(--color-primary)]"}
                    `}
                  ></i>

                  {/* Label — hidden when collapsed */}
                  {isOpen && (
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {cat.name}
                    </span>
                  )}

                  {/* Active indicator arrow */}
                  {isOpen && isActive && (
                    <i className="fa-solid fa-chevron-right ml-auto text-xs opacity-70 shrink-0"></i>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Sidebar footer: opening hours ── */}
      <div
        className={`
          shrink-0 border-t border-[var(--color-border)] py-3
          ${isOpen ? "px-4" : "px-0 flex justify-center"}
        `}
      >
        {isOpen ? (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <i className="fa-solid fa-clock text-[var(--color-accent)] shrink-0"></i>
            <span>{SHOP_INFO.openHours}</span>
          </div>
        ) : (
          <i
            className="fa-solid fa-clock text-sm text-[var(--color-text-muted)]"
            title={SHOP_INFO.openHours}
          ></i>
        )}
      </div>
    </aside>
  );
}
