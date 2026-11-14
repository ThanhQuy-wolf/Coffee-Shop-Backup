"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { catalogService } from "../services/catalog";
import type {
  CategoryInput,
  Combo,
  ComboInput,
  MenuCategory,
  Product,
  ProductInput,
} from "../types";
import { errorMessage } from "../utils/errors";

export interface CatalogContextType {
  products: Product[];
  combos: Combo[];
  categories: MenuCategory[];
  isLoading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;

  // Each action resolves after the server accepted it and the lists were
  // reloaded; it rejects with the ApiError otherwise.
  saveProduct: (input: ProductInput, id?: number) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  setProductAvailability: (id: number, isAvailable: boolean) => Promise<void>;
  saveCombo: (input: ComboInput, id?: number) => Promise<void>;
  deleteCombo: (id: number) => Promise<void>;
  setComboAvailability: (id: number, isAvailable: boolean) => Promise<void>;
  saveCategory: (input: CategoryInput, id?: number) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

/** Catalog as seen by staff (includes items not on sale). */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [p, c, cat] = await Promise.all([
        catalogService.listProducts(),
        catalogService.listCombos(),
        catalogService.listCategories(),
      ]);
      setProducts(p);
      setCombos(c);
      setCategories(cat);
      setLoadError(null);
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const run =
    <A extends unknown[]>(fn: (...args: A) => Promise<unknown>) =>
    async (...args: A) => {
      await fn(...args);
      await reload();
    };

  const value: CatalogContextType = {
    products,
    combos,
    categories,
    isLoading,
    loadError,
    reload,
    saveProduct: run((input: ProductInput, id?: number) =>
      id
        ? catalogService.updateProduct(id, input)
        : catalogService.createProduct(input),
    ),
    deleteProduct: run(catalogService.deleteProduct),
    setProductAvailability: run(catalogService.setProductAvailability),
    saveCombo: run((input: ComboInput, id?: number) =>
      id
        ? catalogService.updateCombo(id, input)
        : catalogService.createCombo(input),
    ),
    deleteCombo: run(catalogService.deleteCombo),
    setComboAvailability: run(catalogService.setComboAvailability),
    saveCategory: run((input: CategoryInput, id?: number) =>
      id
        ? catalogService.updateCategory(id, input)
        : catalogService.createCategory(input),
    ),
    deleteCategory: run(catalogService.deleteCategory),
  };

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }
  return context;
}
