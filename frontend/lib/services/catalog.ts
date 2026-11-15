// S-6, C-1 → C-19 in docs/05-api.md
import type {
  CategoryInput,
  Combo,
  ComboInput,
  Menu,
  MenuCategory,
  OptionGroup,
  OptionGroupInput,
  OptionValue,
  Product,
  ProductInput,
} from "../types";
import { apiRequest, query } from "./client";

/** Id of the "Tất cả" pseudo-category used by the menu filters. */
export const ALL_CATEGORY_ID = 0;

export const catalogService = {
  /**
   * S-6: the menu customers see, with only the products and combos on sale
   * (BR-13, BR-19).
   *
   * @param q - optional search text, matched against name and description
   * @returns categories, products, combos and the option groups; sold-out
   *   values stay in the groups with `isAvailable: false`
   */
  getMenu(q?: string): Promise<Menu> {
    return apiRequest<Menu>("GET", `/v1/menu${query({ q: q?.trim() })}`);
  },

  /**
   * C-1: lists categories with their product count. Staff and managers.
   *
   * @returns categories by `sortOrder`
   * @throws {ApiError} 401/403 for customers and guests
   */
  listCategories(): Promise<MenuCategory[]> {
    return apiRequest<MenuCategory[]>("GET", "/v1/categories");
  },

  /**
   * C-2: creates a category. Managers only.
   *
   * @param input - name, icon and sort order
   * @returns the new category
   * @throws {ApiError} 400 `VALIDATION` for an empty or duplicate name
   */
  createCategory(input: CategoryInput): Promise<MenuCategory> {
    return apiRequest<MenuCategory>("POST", "/v1/categories", input);
  },

  /**
   * C-3: updates a category. Managers only.
   *
   * @param id - category id
   * @param input - new name, icon and sort order
   * @returns the saved category
   * @throws {ApiError} 404 `NOT_FOUND`, 400 `VALIDATION`
   */
  updateCategory(id: number, input: CategoryInput): Promise<MenuCategory> {
    return apiRequest<MenuCategory>("PUT", `/v1/categories/${id}`, input);
  },

  /**
   * C-4: soft-deletes a category that has no product left (BR-11).
   * Managers only.
   *
   * @param id - category id
   * @throws {ApiError} 422 `BR-11` while products remain
   */
  deleteCategory(id: number): Promise<void> {
    return apiRequest<void>("DELETE", `/v1/categories/${id}`);
  },

  /**
   * C-5: lists products, on sale or not. Staff and managers.
   *
   * @param categoryId - only this category; omit for all
   * @returns products that are not deleted
   * @throws {ApiError} 401/403 for customers and guests
   */
  listProducts(categoryId?: number): Promise<Product[]> {
    return apiRequest<Product[]>(
      "GET",
      `/v1/products${query({ categoryId: categoryId || undefined })}`,
    );
  },

  /**
   * C-6: creates a product. Managers only.
   *
   * @param input - product fields
   * @returns the new product
   * @throws {ApiError} 400 `VALIDATION`, 422 `BR-10`, 404, 409 `BR-12`
   */
  createProduct(input: ProductInput): Promise<Product> {
    return apiRequest<Product>("POST", "/v1/products", input);
  },

  /**
   * C-7: updates a product. The backend writes price changes to `audit_log`
   * (BR-15). Managers only.
   *
   * @param id - product id
   * @param input - new values
   * @returns the saved product
   * @throws {ApiError} 400 `VALIDATION`, 422 `BR-10`, 404, 409 `BR-12`
   */
  updateProduct(id: number, input: ProductInput): Promise<Product> {
    return apiRequest<Product>("PUT", `/v1/products/${id}`, input);
  },

  /**
   * C-8: switches a product on or off sale. Staff may use it when an item
   * runs out.
   *
   * @param id - product id
   * @param isAvailable - `true` to sell it
   * @returns the saved product
   * @throws {ApiError} 404 `NOT_FOUND`
   */
  setProductAvailability(id: number, isAvailable: boolean): Promise<Product> {
    return apiRequest<Product>("PATCH", `/v1/products/${id}/availability`, {
      isAvailable,
    });
  },

  /**
   * C-9: deletes a product. A product that was sold is soft-deleted, so old
   * orders keep it; otherwise it is removed (BR-14). Managers only.
   *
   * @param id - product id
   * @throws {ApiError} 422 `BR-13` while a combo still contains it
   */
  deleteProduct(id: number): Promise<void> {
    return apiRequest<void>("DELETE", `/v1/products/${id}`);
  },

  /**
   * C-10: lists combos with their `sellable` flag. Staff and managers.
   *
   * @returns combos that are not deleted
   * @throws {ApiError} 401/403 for customers and guests
   */
  listCombos(): Promise<Combo[]> {
    return apiRequest<Combo[]>("GET", "/v1/combos");
  },

  /**
   * C-11: creates a combo. Managers only.
   *
   * @param input - combo fields and its products
   * @returns the new combo
   * @throws {ApiError} 400 `VALIDATION`, 422 `BR-10` / `BR-13`, 404
   */
  createCombo(input: ComboInput): Promise<Combo> {
    return apiRequest<Combo>("POST", "/v1/combos", input);
  },

  /**
   * C-12: updates a combo. Managers only.
   *
   * @param id - combo id
   * @param input - new values
   * @returns the saved combo
   * @throws {ApiError} 400 `VALIDATION`, 422 `BR-10` / `BR-13`, 404
   */
  updateCombo(id: number, input: ComboInput): Promise<Combo> {
    return apiRequest<Combo>("PUT", `/v1/combos/${id}`, input);
  },

  /**
   * C-13: switches a combo on or off sale. Managers only.
   *
   * @param id - combo id
   * @param isAvailable - `true` to sell it
   * @returns the saved combo
   * @throws {ApiError} 404 `NOT_FOUND`
   */
  setComboAvailability(id: number, isAvailable: boolean): Promise<Combo> {
    return apiRequest<Combo>("PATCH", `/v1/combos/${id}/availability`, {
      isAvailable,
    });
  },

  /**
   * C-14: deletes a combo; soft delete when it was sold (BR-14). Managers only.
   *
   * @param id - combo id
   * @throws {ApiError} 404 `NOT_FOUND`
   */
  deleteCombo(id: number): Promise<void> {
    return apiRequest<void>("DELETE", `/v1/combos/${id}`);
  },

  /**
   * C-15: option groups with their values and how many products use each.
   * Staff and managers.
   *
   * @returns the groups by `sortOrder`
   * @throws {ApiError} 401/403 for customers and guests
   */
  listOptionGroups(): Promise<OptionGroup[]> {
    return apiRequest<OptionGroup[]>("GET", "/v1/option-groups");
  },

  /**
   * C-16: creates an option group with its values. Managers only.
   *
   * @param input - group fields and values
   * @returns the saved group
   * @throws {ApiError} 400 `VALIDATION`, 409 `BR-16`, 422 `BR-16` / `BR-17`
   */
  createOptionGroup(input: OptionGroupInput): Promise<OptionGroup> {
    return apiRequest<OptionGroup>("POST", "/v1/option-groups", input);
  },

  /**
   * C-17: updates a group and its values. Values with an id are edited, new
   * ones added, missing ones removed: soft delete when an order already used
   * them (BR-19). Delta changes go to audit_log (BR-17). Managers only.
   *
   * @param id - option group id
   * @param input - group fields and the full list of values
   * @returns the saved group
   * @throws {ApiError} 404 `NOT_FOUND`, 400 `VALIDATION`, 409 `BR-16`,
   *   422 `BR-16` / `BR-17`
   */
  updateOptionGroup(id: number, input: OptionGroupInput): Promise<OptionGroup> {
    return apiRequest<OptionGroup>("PUT", `/v1/option-groups/${id}`, input);
  },

  /**
   * C-18: deletes an option group; soft delete when one of its values was
   * sold (BR-19). Managers only.
   *
   * @param id - option group id
   * @throws {ApiError} 404 `NOT_FOUND`, 422 `BR-19` while a product uses it
   */
  deleteOptionGroup(id: number): Promise<void> {
    return apiRequest<void>("DELETE", `/v1/option-groups/${id}`);
  },

  /**
   * C-19: switches one option value on or off sale. Staff may switch off a
   * value that ran out; the product stays on sale (BR-19).
   *
   * @param valueId - option value id
   * @param isAvailable - `true` to sell it
   * @returns the saved value
   * @throws {ApiError} 404 `NOT_FOUND`
   */
  setOptionValueAvailability(
    valueId: number,
    isAvailable: boolean,
  ): Promise<OptionValue> {
    return apiRequest<OptionValue>(
      "PATCH",
      `/v1/option-values/${valueId}/availability`,
      { isAvailable },
    );
  },
};
