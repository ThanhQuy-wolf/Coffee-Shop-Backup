"use client";

import { createContext, useContext, useState } from "react";

import { ALL_CATEGORY_ID } from "../services/catalog";
import type { MenuCategory } from "../types";

interface MenuContextType {
  /** Menu categories, "Tất cả" first */
  menuCategories: MenuCategory[];
  /** Id of the selected category, `ALL_CATEGORY_ID` for "Tất cả". */
  activeCategory: number;
  /**
   * Selects a category.
   *
   * @param id - category id, or `ALL_CATEGORY_ID`
   */
  setActiveCategory: (id: number) => void;
}

const MenuContext = createContext<MenuContextType>({
  menuCategories: [],
  activeCategory: ALL_CATEGORY_ID,
  setActiveCategory: () => {},
});

/**
 * Builds the "Tất cả" pseudo-category shown first in the filters.
 *
 * @returns a category with id `ALL_CATEGORY_ID`
 */
function allCategory(): MenuCategory {
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
 *
 * @param props.categories - categories from the menu (S-6), sorted
 * @param props.children - the menu page
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

/**
 * Reads the menu categories and the selected one.
 *
 * @returns the menu context; outside `MenuProvider` the list is empty
 */
export function useMenu() {
  return useContext(MenuContext);
}
