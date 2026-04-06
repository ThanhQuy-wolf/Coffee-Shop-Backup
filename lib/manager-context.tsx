"use client";

import { ReactNode, createContext, useContext, useState } from "react";

import { MENU_CATEGORIES, MOCK_COMBOS, MOCK_PRODUCTS } from "./constants";
import type { Combo, ComboItem, MenuCategory, Product } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ManagerTab = "products" | "combos" | "categories";

interface ManagerContextType {
  // Data
  products: Product[];
  combos: Combo[];
  categories: MenuCategory[];

  // Active tab
  activeTab: ManagerTab;
  setActiveTab: (tab: ManagerTab) => void;

  // Product actions
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  toggleProductAvailability: (id: number) => void;

  // Combo actions
  addCombo: (combo: Omit<Combo, "id">) => void;
  updateCombo: (combo: Combo) => void;
  deleteCombo: (id: number) => void;
  toggleComboAvailability: (id: number) => void;

  // Category actions
  addCategory: (category: Omit<MenuCategory, "id">) => void;
  updateCategory: (category: MenuCategory) => void;
  deleteCategory: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ManagerContext = createContext<ManagerContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ManagerProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [combos, setCombos] = useState<Combo[]>(MOCK_COMBOS);
  // Filter out the "all" pseudo-category — managers manage real categories only
  const [categories, setCategories] = useState<MenuCategory[]>(
    MENU_CATEGORIES.filter((c) => c.id !== "all"),
  );
  const [activeTab, setActiveTab] = useState<ManagerTab>("products");

  // ── Product actions ──────────────────────────────────────────────────────

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now(),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleProductAvailability = (id: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, available: !(p.available ?? true) } : p,
      ),
    );
  };

  // ── Combo actions ────────────────────────────────────────────────────────

  const addCombo = (combo: Omit<Combo, "id">) => {
    const newCombo: Combo = { ...combo, id: Date.now() };
    setCombos((prev) => [...prev, newCombo]);
  };

  const updateCombo = (combo: Combo) => {
    setCombos((prev) => prev.map((c) => (c.id === combo.id ? combo : c)));
  };

  const deleteCombo = (id: number) => {
    setCombos((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleComboAvailability = (id: number) => {
    setCombos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, available: !c.available } : c)),
    );
  };

  // ── Category actions ─────────────────────────────────────────────────────

  const addCategory = (category: Omit<MenuCategory, "id">) => {
    const slug = category.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const newCategory: MenuCategory = {
      ...category,
      id: `${slug}-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (category: MenuCategory) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? category : c)),
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <ManagerContext.Provider
      value={{
        products,
        combos,
        categories,
        activeTab,
        setActiveTab,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        addCombo,
        updateCombo,
        deleteCombo,
        toggleComboAvailability,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </ManagerContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useManager() {
  const context = useContext(ManagerContext);
  if (context === undefined) {
    throw new Error("useManager must be used within a ManagerProvider");
  }
  return context;
}
