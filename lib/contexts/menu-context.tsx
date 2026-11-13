"use client";

import { createContext, useContext, useState } from "react";

interface MenuContextType {
  /** Currently selected category id */
  activeCategory: string;
  /** Update the active category */
  setActiveCategory: (id: string) => void;
}

const MenuContext = createContext<MenuContextType>({
  activeCategory: "all",
  setActiveCategory: () => {},
});

/**
 * Provides shared activeCategory state to both the Header (mobile scrollable menu)
 * and the Navbar sidebar (md+), so both always reflect the same selection.
 */
export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <MenuContext.Provider value={{ activeCategory, setActiveCategory }}>
      {children}
    </MenuContext.Provider>
  );
}

/** Consume the shared menu state anywhere inside MenuProvider */
export function useMenu() {
  return useContext(MenuContext);
}
