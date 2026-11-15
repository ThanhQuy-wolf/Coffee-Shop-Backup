"use client";

import { Icon } from "@/components/atoms";
import { useMenu } from "@/lib/contexts/menu-context";
import type { MenuCategory } from "@/lib/types";
import type React from "react";

import type { CategorySidebarProps } from "./Navigation.types";
import { categoryButtonClass, categoryIconClass } from "./categoryStyles";

/**
 * Category sidebar of the menu page, from `md` up. Collapsed it is 64 px wide
 * and shows icons only; expanded it is 240 px with labels. On `xl` it is
 * always expanded. Selecting a category updates the shared menu state.
 * @param props.isOpen Expanded (true) or icons only (false).
 * @param props.onToggle Called by the toggle button.
 * @param props.openHours Opening hours shown at the bottom.
 */
export default function CategorySidebar({
  isOpen,
  onToggle,
  openHours,
}: CategorySidebarProps) {
  const { menuCategories, activeCategory, setActiveCategory } = useMenu();

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
      <div
        className={`flex shrink-0 items-center border-b border-(--color-border) xl:justify-between xl:px-4 xl:py-3 ${isOpen ? "justify-between px-4 py-3" : "justify-center px-0 py-3"} `}
      >
        <span
          className={`text-xs font-bold tracking-widest whitespace-nowrap text-(--color-text-muted) uppercase ${isOpen ? "block" : "hidden"} xl:block`}
        >
          <Icon name="utensils" className="mr-2 text-(--color-primary)" />
          Thực Đơn
        </span>

        <button
          onClick={onToggle}
          title={isOpen ? "Thu gọn menu" : "Mở rộng menu"}
          aria-label={isOpen ? "Thu gọn menu" : "Mở rộng menu"}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-(--color-text-muted) transition-colors duration-150 hover:bg-(--color-border-light) hover:text-(--color-primary) xl:hidden"
        >
          <Icon
            name={isOpen ? "chevron-left" : "chevron-right"}
            className="text-sm"
          />
        </button>
      </div>

      <nav className="flex-1 py-2">
        <ul className="flex flex-col gap-0.5 px-2">
          {menuCategories.map((cat: MenuCategory) => {
            const isActive = activeCategory === cat.id;
            return (
              <li key={cat.id}>
                <button
                  onClick={() => setActiveCategory(cat.id)}
                  title={!isOpen ? cat.name : undefined}
                  className={`flex w-full cursor-pointer items-center rounded-xl border-none text-sm font-medium transition-all duration-150 xl:justify-start xl:gap-3 xl:px-3 xl:py-2.5 ${isOpen ? "gap-3 px-3 py-2.5" : "justify-center px-0 py-2.5"} ${categoryButtonClass(isActive)}`}
                >
                  <Icon
                    name={cat.icon}
                    className={`w-5 text-base ${categoryIconClass(isActive)}`}
                  />

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

      <div
        className={`shrink-0 border-t border-(--color-border) py-3 xl:px-4 ${isOpen ? "px-4" : "flex justify-center px-0"} `}
      >
        <div
          className={`items-center gap-2 text-xs text-(--color-text-muted) ${isOpen ? "flex" : "hidden"} xl:flex`}
        >
          <Icon name="clock" className="shrink-0 text-(--color-accent)" />
          <span>{openHours}</span>
        </div>

        <span className="xl:hidden">
          <span title={openHours} className={isOpen ? "hidden" : "block"}>
            <Icon
              name="clock"
              label={openHours}
              className="text-sm text-(--color-text-muted)"
            />
          </span>
        </span>
      </div>
    </aside>
  );
}
