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

/**
 * Catalog data and actions. Every action resolves once the server accepted it
 * and the lists were reloaded, and rejects with the `ApiError` otherwise, so a
 * form can show the error and stay open.
 */
export interface CatalogContextType {
  /** All products that are not deleted, on sale or not (C-5). */
  products: Product[];
  /** All combos that are not deleted, with their `sellable` flag (C-10). */
  combos: Combo[];
  /** Categories with their product count (C-1). */
  categories: MenuCategory[];
  /** `true` until the first load finished. */
  isLoading: boolean;
  /** Error text of the last load, `null` when it succeeded. */
  loadError: string | null;
  /** Loads the three lists again. */
  reload: () => Promise<void>;
  /**
   * Creates a product (C-6) or updates one (C-7).
   *
   * @param input - product fields
   * @param id - product to update; omit to create
   */
  saveProduct: (input: ProductInput, id?: number) => Promise<void>;
  /**
   * Deletes a product (C-9). A product that was sold is only hidden (BR-14).
   *
   * @param id - product id
   */
  deleteProduct: (id: number) => Promise<void>;
  /**
   * Switches a product on or off sale (C-8).
   *
   * @param id - product id
   * @param isAvailable - `true` to sell it
   */
  setProductAvailability: (id: number, isAvailable: boolean) => Promise<void>;
  /**
   * Creates a combo (C-11) or updates one (C-12).
   *
   * @param input - combo fields and its products
   * @param id - combo to update; omit to create
   */
  saveCombo: (input: ComboInput, id?: number) => Promise<void>;
  /**
   * Deletes a combo (C-14). A combo that was sold is only hidden (BR-14).
   *
   * @param id - combo id
   */
  deleteCombo: (id: number) => Promise<void>;
  /**
   * Switches a combo on or off sale (C-13).
   *
   * @param id - combo id
   * @param isAvailable - `true` to sell it
   */
  setComboAvailability: (id: number, isAvailable: boolean) => Promise<void>;
  /**
   * Creates a category (C-2) or updates one (C-3).
   *
   * @param input - name, icon and sort order
   * @param id - category to update; omit to create
   */
  saveCategory: (input: CategoryInput, id?: number) => Promise<void>;
  /**
   * Deletes an empty category (C-4, BR-11).
   *
   * @param id - category id
   */
  deleteCategory: (id: number) => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

/**
 * Loads the catalog as staff see it (items off sale included) and exposes the
 * CRUD actions. Mounted by the manager layout.
 *
 * @param props.children - pages that use `useCatalog()`
 */
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- state is set only after the service call resolves
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

/**
 * Reads the catalog and its actions.
 *
 * @returns the catalog context (see `CatalogContextType`)
 * @throws {Error} when used outside `CatalogProvider`
 */
export function useCatalog() {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }
  return context;
}
