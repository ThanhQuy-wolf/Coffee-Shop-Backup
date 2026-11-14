"use client";

import { ReactNode, createContext, useContext, useMemo, useState } from "react";

import {
  getAllCategory,
  getCategories,
  getCombos,
  getProducts,
} from "../services/catalog";
import type { Combo, MenuCategory, Product } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CatalogContextType {
  // Data
  products: Product[];
  combos: Combo[];
  /** Real categories (no "all"), as managed by the manager */
  categories: MenuCategory[];
  /** "Tất cả" + categories — for customer-facing menus */
  menuCategories: MenuCategory[];

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

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

const ALL_CATEGORY = getAllCategory();

/**
 * Menu catalog (products, combos, categories) shared by the whole app.
 * Mounted at the root so changes made in /manager show up on the customer
 * menu. Data is in-memory mock data for now — swap the initial state and
 * actions for API calls when the backend is ready.
 */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(getProducts);
  const [combos, setCombos] = useState<Combo[]>(getCombos);
  // Filter out the "all" pseudo-category — managers manage real categories only
  const [categories, setCategories] = useState<MenuCategory[]>(getCategories);

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

  const menuCategories = useMemo(
    () => [ALL_CATEGORY, ...categories],
    [categories],
  );

  return (
    <CatalogContext.Provider
      value={{
        products,
        combos,
        categories,
        menuCategories,
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
    </CatalogContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }
  return context;
}
