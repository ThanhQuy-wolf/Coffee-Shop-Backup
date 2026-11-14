// S-6, C-1 → C-14 in docs/05-api.md
import {
  type ComboRow,
  clone,
  db,
  delay,
  fail,
  iso,
  mockNow,
  nextId,
  requireActor,
} from "../mock-data/db";
import type {
  CategoryInput,
  Combo,
  ComboInput,
  Menu,
  MenuCategory,
  Product,
  ProductInput,
} from "../types";

/** Id of the "Tất cả" pseudo-category used by the menu filters. */
export const ALL_CATEGORY_ID = 0;

/** Products that are not soft-deleted. */
const liveProducts = () => db.products.filter((p) => !p.deletedAt);
/** Combos that are not soft-deleted. */
const liveCombos = () => db.combos.filter((c) => !c.deletedAt);
/** Categories that are not soft-deleted, by `sortOrder`. */
const liveCategories = () =>
  db.categories
    .filter((c) => !c.deletedAt)
    .sort((a, b) => a.sortOrder - b.sortOrder);

/**
 * Turns a mock row into the API shape.
 *
 * @param row - row with `deletedAt`
 * @returns a deep copy without `deletedAt`
 */
function stripDeleted<T extends { deletedAt: string | null }>(row: T) {
  const { deletedAt: _, ...rest } = row;
  return clone(rest);
}

/**
 * Converts a combo row and computes `sellable`: a combo is on sale only when
 * it is switched on and every product in it is on sale (BR-13).
 *
 * @param row - combo row
 * @returns the combo in API shape
 */
function toCombo(row: ComboRow): Combo {
  const sellable =
    row.isAvailable &&
    row.items.every((i) => {
      const p = db.products.find((x) => x.id === i.productId);
      return !!p && !p.deletedAt && p.isAvailable;
    });
  return { ...stripDeleted(row), sellable };
}

/**
 * Tells whether an item appears in any order, which decides between soft and
 * hard delete (BR-14).
 *
 * @param type - `PRODUCT` or `COMBO`
 * @param id - product or combo id
 */
function wasSold(type: "PRODUCT" | "COMBO", id: number) {
  return db.orders.some((o) =>
    o.items.some((i) => i.type === type && i.id === id),
  );
}

/**
 * Finds a category that is not deleted.
 *
 * @param id - category id
 * @throws {ApiError} 404 `NOT_FOUND`
 */
function findCategory(id: number) {
  const c = db.categories.find((x) => x.id === id && !x.deletedAt);
  if (!c) fail(404, "NOT_FOUND", "Không tìm thấy danh mục");
  return c;
}

/**
 * Finds a product that is not deleted.
 *
 * @param id - product id
 * @throws {ApiError} 404 `NOT_FOUND`
 */
function findProduct(id: number) {
  const p = db.products.find((x) => x.id === id && !x.deletedAt);
  if (!p) fail(404, "NOT_FOUND", "Không tìm thấy món");
  return p;
}

/**
 * Finds a combo that is not deleted.
 *
 * @param id - combo id
 * @throws {ApiError} 404 `NOT_FOUND`
 */
function findCombo(id: number) {
  const c = db.combos.find((x) => x.id === id && !x.deletedAt);
  if (!c) fail(404, "NOT_FOUND", "Không tìm thấy combo");
  return c;
}

/**
 * Checks a product before saving: name, prices (BR-10), category and unique
 * name, case-insensitive (BR-12).
 *
 * @param input - product fields
 * @param selfId - id of the product being updated, so it does not clash
 *   with its own name
 * @throws {ApiError} 400 `VALIDATION`, 422 `BR-10`, 404, 409 `BR-12`
 */
function validateProduct(input: ProductInput, selfId?: number) {
  if (!input.name.trim())
    fail(400, "VALIDATION", "Tên món không được để trống");
  if (!Number.isInteger(input.price) || input.price <= 0)
    fail(422, "BR-10", "Giá bán phải là số nguyên lớn hơn 0");
  if (!Number.isInteger(input.costPrice) || input.costPrice < 0)
    fail(422, "BR-10", "Giá vốn phải là số nguyên không âm");
  findCategory(input.categoryId);
  const name = input.name.trim().toLowerCase();
  if (
    liveProducts().some((p) => p.id !== selfId && p.name.toLowerCase() === name)
  )
    fail(409, "BR-12", "Tên món đã tồn tại");
}

/**
 * Checks a combo before saving: name, price (BR-10), at least two units in
 * total and existing products (BR-13).
 *
 * @param input - combo fields
 * @throws {ApiError} 400 `VALIDATION`, 422 `BR-10` / `BR-13`, 404
 */
function validateCombo(input: ComboInput) {
  if (!input.name.trim())
    fail(400, "VALIDATION", "Tên combo không được để trống");
  if (!Number.isInteger(input.price) || input.price <= 0)
    fail(422, "BR-10", "Giá combo phải là số nguyên lớn hơn 0");
  const totalQty = input.items.reduce((s, i) => s + i.quantity, 0);
  if (totalQty < 2) fail(422, "BR-13", "Combo phải có ít nhất 2 món");
  for (const item of input.items) findProduct(item.productId);
}

export const catalogService = {
  /**
   * S-6: the menu customers see, with only the products and combos on sale
   * (BR-13).
   *
   * @param q - optional search text, matched against name and description
   * @returns categories, products and combos
   */
  async getMenu(q?: string): Promise<Menu> {
    await delay();
    const query = q?.trim().toLowerCase() ?? "";
    const match = (x: { name: string; description: string }) =>
      !query ||
      x.name.toLowerCase().includes(query) ||
      x.description.toLowerCase().includes(query);
    return {
      categories: liveCategories().map(stripDeleted),
      products: liveProducts()
        .filter((p) => p.isAvailable && match(p))
        .map(stripDeleted),
      combos: liveCombos()
        .map(toCombo)
        .filter((c) => c.sellable && match(c)),
    };
  },

  /**
   * C-1: lists categories with their product count. Staff and managers.
   *
   * @returns categories by `sortOrder`
   */
  async listCategories(): Promise<MenuCategory[]> {
    await delay();
    requireActor(["STAFF", "MANAGER"]);
    return liveCategories().map((c) => ({
      ...stripDeleted(c),
      productCount: liveProducts().filter((p) => p.categoryId === c.id).length,
    }));
  },

  /**
   * C-2: creates a category. Managers only.
   *
   * @param input - name, icon and sort order
   * @returns the new category
   * @throws {ApiError} 400 `VALIDATION` for an empty name
   */
  async createCategory(input: CategoryInput): Promise<MenuCategory> {
    await delay();
    requireActor(["MANAGER"]);
    if (!input.name.trim())
      fail(400, "VALIDATION", "Tên danh mục không được để trống");
    const row = { ...input, id: nextId(), deletedAt: null };
    db.categories.push(row);
    return { ...stripDeleted(row), productCount: 0 };
  },

  /**
   * C-3: updates a category. Managers only.
   *
   * @param id - category id
   * @param input - new name, icon and sort order
   * @returns the saved category
   */
  async updateCategory(
    id: number,
    input: CategoryInput,
  ): Promise<MenuCategory> {
    await delay();
    const c = findCategory(id);
    requireActor(["MANAGER"]);
    Object.assign(c, input);
    return stripDeleted(c);
  },

  /**
   * C-4: soft-deletes a category that has no product left (BR-11).
   * Managers only.
   *
   * @param id - category id
   * @throws {ApiError} 422 `BR-11` while products remain
   */
  async deleteCategory(id: number): Promise<void> {
    await delay();
    const c = findCategory(id);
    requireActor(["MANAGER"]);
    const count = liveProducts().filter((p) => p.categoryId === id).length;
    if (count > 0)
      fail(
        422,
        "BR-11",
        `Danh mục còn ${count} món, hãy chuyển món sang danh mục khác trước`,
      );
    c.deletedAt = iso(mockNow());
  },

  /**
   * C-5: lists products, on sale or not. Staff and managers.
   *
   * @param categoryId - only this category; omit for all
   * @returns products that are not deleted
   */
  async listProducts(categoryId?: number): Promise<Product[]> {
    await delay();
    requireActor(["STAFF", "MANAGER"]);
    return liveProducts()
      .filter((p) => !categoryId || p.categoryId === categoryId)
      .map(stripDeleted);
  },

  /**
   * C-6: creates a product. Managers only.
   *
   * @param input - product fields
   * @returns the new product
   * @throws {ApiError} see `validateProduct`
   */
  async createProduct(input: ProductInput): Promise<Product> {
    await delay();
    requireActor(["MANAGER"]);
    validateProduct(input);
    const row = {
      ...input,
      name: input.name.trim(),
      id: nextId(),
      deletedAt: null,
    };
    db.products.push(row);
    return stripDeleted(row);
  },

  /**
   * C-7: updates a product. The backend writes price changes to `audit_log`
   * (BR-15). Managers only.
   *
   * @param id - product id
   * @param input - new values
   * @returns the saved product
   * @throws {ApiError} see `validateProduct`
   */
  async updateProduct(id: number, input: ProductInput): Promise<Product> {
    await delay();
    const p = findProduct(id);
    requireActor(["MANAGER"]);
    validateProduct(input, id);
    Object.assign(p, input, { name: input.name.trim() });
    return stripDeleted(p);
  },

  /**
   * C-8: switches a product on or off sale. Staff may use it when an item
   * runs out.
   *
   * @param id - product id
   * @param isAvailable - `true` to sell it
   * @returns the saved product
   */
  async setProductAvailability(
    id: number,
    isAvailable: boolean,
  ): Promise<Product> {
    await delay();
    const p = findProduct(id);
    requireActor(["STAFF", "MANAGER"]);
    p.isAvailable = isAvailable;
    return stripDeleted(p);
  },

  /**
   * C-9: deletes a product. A product that was sold is soft-deleted, so old
   * orders keep it; otherwise it is removed (BR-14). Managers only.
   *
   * @param id - product id
   * @throws {ApiError} 422 `BR-13` while a combo still contains it
   */
  async deleteProduct(id: number): Promise<void> {
    await delay();
    const p = findProduct(id);
    requireActor(["MANAGER"]);
    if (liveCombos().some((c) => c.items.some((i) => i.productId === id)))
      fail(422, "BR-13", "Món đang nằm trong combo, hãy gỡ khỏi combo trước");
    if (wasSold("PRODUCT", id)) p.deletedAt = iso(mockNow());
    else db.products.splice(db.products.indexOf(p), 1);
  },

  /**
   * C-10: lists combos with their `sellable` flag. Staff and managers.
   *
   * @returns combos that are not deleted
   */
  async listCombos(): Promise<Combo[]> {
    await delay();
    requireActor(["STAFF", "MANAGER"]);
    return liveCombos().map(toCombo);
  },

  /**
   * C-11: creates a combo. Managers only.
   *
   * @param input - combo fields and its products
   * @returns the new combo
   * @throws {ApiError} see `validateCombo`
   */
  async createCombo(input: ComboInput): Promise<Combo> {
    await delay();
    requireActor(["MANAGER"]);
    validateCombo(input);
    const row: ComboRow = {
      ...clone(input),
      id: nextId(),
      deletedAt: null,
    };
    db.combos.push(row);
    return toCombo(row);
  },

  /**
   * C-12: updates a combo. Managers only.
   *
   * @param id - combo id
   * @param input - new values
   * @returns the saved combo
   * @throws {ApiError} see `validateCombo`
   */
  async updateCombo(id: number, input: ComboInput): Promise<Combo> {
    await delay();
    const c = findCombo(id);
    requireActor(["MANAGER"]);
    validateCombo(input);
    Object.assign(c, clone(input));
    return toCombo(c);
  },

  /**
   * C-13: switches a combo on or off sale. Managers only.
   *
   * @param id - combo id
   * @param isAvailable - `true` to sell it
   * @returns the saved combo
   */
  async setComboAvailability(id: number, isAvailable: boolean): Promise<Combo> {
    await delay();
    const c = findCombo(id);
    requireActor(["MANAGER"]);
    c.isAvailable = isAvailable;
    return toCombo(c);
  },

  /**
   * C-14: deletes a combo; soft delete when it was sold (BR-14). Managers only.
   *
   * @param id - combo id
   */
  async deleteCombo(id: number): Promise<void> {
    await delay();
    const c = findCombo(id);
    requireActor(["MANAGER"]);
    if (wasSold("COMBO", id)) c.deletedAt = iso(mockNow());
    else db.combos.splice(db.combos.indexOf(c), 1);
  },
};
