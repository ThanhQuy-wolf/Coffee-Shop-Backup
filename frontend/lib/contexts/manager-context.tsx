"use client";

import { ReactNode, createContext, useContext, useState } from "react";

import { type CatalogContextType, useCatalog } from "./catalog-context";

export type ManagerTab =
  "products" | "combos" | "categories" | "shop" | "reviews";

interface ManagerContextType extends CatalogContextType {
  activeTab: ManagerTab;
  setActiveTab: (tab: ManagerTab) => void;
}

const ManagerContext = createContext<
  Pick<ManagerContextType, "activeTab" | "setActiveTab"> | undefined
>(undefined);

/** Manager-only UI state (active tab). Catalog data lives in CatalogProvider. */
export function ManagerProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<ManagerTab>("products");
  return (
    <ManagerContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ManagerContext.Provider>
  );
}

/** Catalog data/actions + manager tab state. */
export function useManager(): ManagerContextType {
  const tab = useContext(ManagerContext);
  const catalog = useCatalog();
  if (tab === undefined) {
    throw new Error("useManager must be used within a ManagerProvider");
  }
  return { ...catalog, ...tab };
}
