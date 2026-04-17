"use client";

import { MENU_CATEGORIES, SHOP_INFO } from "@/lib/constants";
import type { MenuCategory } from "@/lib/types";
import type React from "react";

import type { CategorySidebarProps } from "./Navigation.types";

/**
 * Left sidebar — always visible, collapsible on all screen sizes.
 *
 * Collapsed  → 64 px wide, icon only
 * Expanded   → 240 px wide, icon + label
 *
 * Width transition is handled by Tailwind w-16 / w-60 + transition-all.
 * Parent controls open/close state via isOpen + onToggle props.
 */
export default function CategorySidebar({
  isOpen,
  onToggle,
  activeCategory = "all",
  onCategoryChange,
}: CategorySidebarProps) {
  return (
    <aside
      className={`sticky z-20 hidden shrink-0 flex-col overflow-x-hidden overflow-y-auto border-r border-(--color-border) bg-(--color-bg-sidebar) transition-all duration-250 ease-in-out md:flex xl:w-60 ${isOpen ? "w-60" : "w-16"} `}
      style={
        {
          top: "var(--spacing-header-height)",
          height: "calc(100vh - var(--spacing-header-height))",
        } as React.CSSProperties
      }
    >
      {/* ── Sidebar header: title + toggle button ── */}
      <div
        className={`flex shrink-0 items-center border-b border-(--color-border) xl:justify-between xl:px-4 xl:py-3 ${isOpen ? "justify-between px-4 py-3" : "justify-center px-0 py-3"} `}
      >
        {/* Title — shown when expanded, always shown on xl+ */}
        <span
          className={`text-xs font-bold tracking-widest whitespace-nowrap text-(--color-text-muted) uppercase ${isOpen ? "block" : "hidden"} xl:block`}
        >
          <i className="fa-solid fa-utensils mr-2 text-(--color-primary)"></i>
          Thực Đơn
        </span>

        {/* Toggle button — hidden on xl+ (sidebar is always expanded there) */}
        <button
          onClick={onToggle}
          title={isOpen ? "Thu gọn menu" : "Mở rộng menu"}
          aria-label={isOpen ? "Thu gọn menu" : "Mở rộng menu"}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-(--color-text-muted) transition-colors duration-150 hover:bg-(--color-border-light) hover:text-(--color-primary) xl:hidden"
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
                  className={`flex w-full cursor-pointer items-center rounded-xl border-none text-sm font-medium transition-all duration-150 xl:justify-start xl:gap-3 xl:px-3 xl:py-2.5 ${isOpen ? "gap-3 px-3 py-2.5" : "justify-center px-0 py-2.5"} ${
                    isActive
                      ? "bg-(--color-primary) text-white shadow-sm"
                      : "bg-transparent text-(--color-text-secondary) hover:bg-(--color-border-light) hover:text-(--color-primary-dark)"
                  } `}
                >
                  {/* Icon */}
                  <i
                    className={` ${cat.icon} w-5 shrink-0 text-center text-base ${isActive ? "text-white" : "text-(--color-primary)"} `}
                  ></i>

                  {/* Label — hidden when collapsed, always shown on xl+ */}
                  <span
                    className={`overflow-hidden text-ellipsis whitespace-nowrap ${isOpen ? "block" : "hidden"} xl:block`}
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
        className={`shrink-0 border-t border-(--color-border) py-3 xl:px-4 ${isOpen ? "px-4" : "flex justify-center px-0"} `}
      >
        {/* Text row — shown when expanded, always shown on xl+ */}
        <div
          className={`items-center gap-2 text-xs text-(--color-text-muted) ${isOpen ? "flex" : "hidden"} xl:flex`}
        >
          <i className="fa-solid fa-clock shrink-0 text-(--color-accent)"></i>
          <span>{SHOP_INFO.openHours}</span>
        </div>

        {/* Icon-only — shown when collapsed, hidden on xl+ */}
        <span className="xl:hidden">
          <i
            className={`fa-solid fa-clock text-sm text-(--color-text-muted) ${isOpen ? "hidden" : "block"}`}
            title={SHOP_INFO.openHours}
          ></i>
        </span>
      </div>
    </aside>
  );
}
