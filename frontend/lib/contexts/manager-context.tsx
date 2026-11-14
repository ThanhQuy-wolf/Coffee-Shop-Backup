"use client";

import { ReactNode, createContext, useContext, useState } from "react";

import { type CatalogContextType, useCatalog } from "./catalog-context";

/** Tabs of the /manager page. */
export type ManagerTab =
  "products" | "combos" | "categories" | "shop" | "reviews";

interface ManagerContextType extends CatalogContextType {
  /** Tab shown on /manager. */
  activeTab: ManagerTab;
  /**
   * Switches the tab.
   *
   * @param tab - tab to show
   */
  setActiveTab: (tab: ManagerTab) => void;
}

const ManagerContext = createContext<
  Pick<ManagerContextType, "activeTab" | "setActiveTab"> | undefined
>(undefined);

/**
 * Holds the manager page's UI state (active tab). Catalog data lives in
 * `CatalogProvider`, which must wrap this provider.
 *
 * @param props.children - manager pages
 */
export function ManagerProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<ManagerTab>("products");
  return (
    <ManagerContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ManagerContext.Provider>
  );
}

/**
 * Reads the catalog together with the manager tab state.
 *
 * @returns catalog data and actions plus `activeTab` / `setActiveTab`
 * @throws {Error} when used outside `ManagerProvider` or `CatalogProvider`
 */
export function useManager(): ManagerContextType {
  const tab = useContext(ManagerContext);
  const catalog = useCatalog();
  if (tab === undefined) {
    throw new Error("useManager must be used within a ManagerProvider");
  }
  return { ...catalog, ...tab };
}
