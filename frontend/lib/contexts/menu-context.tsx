"use client";

import { createContext, useContext, useState } from "react";

import { ALL_CATEGORY_ID } from "../services/catalog";
import type { MenuCategory } from "../types";

interface MenuContextType {
  /** Menu categories, "Tất cả" first */
  menuCategories: MenuCategory[];
  activeCategory: number;
  setActiveCategory: (id: number) => void;
}

const MenuContext = createContext<MenuContextType>({
  menuCategories: [],
  activeCategory: ALL_CATEGORY_ID,
  setActiveCategory: () => {},
});

export function allCategory(): MenuCategory {
  return {
    id: ALL_CATEGORY_ID,
    name: "Tất cả",
    icon: "fa-solid fa-border-all",
    sortOrder: 0,
  };
}

/**
 * Shares the selected category between the desktop sidebar and the mobile
 * tabs of the menu page.
 */
export function MenuProvider({
  categories,
  children,
}: {
  categories: MenuCategory[];
  children: React.ReactNode;
}) {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY_ID);
  const menuCategories = categories.length
    ? [allCategory(), ...categories]
    : [];

  return (
    <MenuContext.Provider
      value={{ menuCategories, activeCategory, setActiveCategory }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  return useContext(MenuContext);
}
