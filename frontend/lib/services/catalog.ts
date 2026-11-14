// ─── Catalog service: categories, products, combos ───────────────────────────
// Returns mock data for now. When the backend is ready, replace the bodies
// with API calls (see client.ts) — callers only depend on these functions.
import { MENU_CATEGORIES, MOCK_COMBOS, MOCK_PRODUCTS } from "../mock-data/menu";
import type { Combo, MenuCategory, Product } from "../types";

/** id of the pseudo-category that means "every category" */
export const ALL_CATEGORY_ID = "all";

/** All categories, including the "Tất cả" pseudo-category first. */
export function getMenuCategories(): MenuCategory[] {
  return MENU_CATEGORIES;
}

/** Real categories only (without "Tất cả"). */
export function getCategories(): MenuCategory[] {
  return MENU_CATEGORIES.filter((c) => c.id !== ALL_CATEGORY_ID);
}

export function getAllCategory(): MenuCategory {
  return MENU_CATEGORIES.find((c) => c.id === ALL_CATEGORY_ID)!;
}

export function getProducts(): Product[] {
  return MOCK_PRODUCTS;
}

export function getCombos(): Combo[] {
  return MOCK_COMBOS;
}
