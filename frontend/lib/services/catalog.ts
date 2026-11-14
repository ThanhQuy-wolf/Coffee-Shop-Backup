// S-6, C-1 → C-19 in docs/05-api.md
import {
  type ComboRow,
  type OptionGroupRow,
  type ProductRow,
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
  OptionGroup,
  OptionGroupInput,
  OptionValue,
  Product,
  ProductInput,
} from "../types";
import { groupsOf, optionsSellable } from "../utils/options";

/** Id of the "Tất cả" pseudo-category used by the menu filters. */
export const ALL_CATEGORY_ID = 0;

/** Products that are not soft-deleted. */
const liveProducts = () => db.products.filter((p) => !p.deletedAt);
/** Combos that are not soft-deleted. */
const liveCombos = () => db.combos.filter((c) => !c.deletedAt);
/** Option groups that are not soft-deleted, by `sortOrder`. */
const liveGroups = () =>
  db.optionGroups
    .filter((g) => !g.deletedAt)
    .sort((a, b) => a.sortOrder - b.sortOrder);
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
 * Converts an option group row to the API shape, without deleted values.
 *
 * @param row - option group row
 * @returns the group with its values by `sortOrder`
 */
function toGroup(row: OptionGroupRow): OptionGroup {
  const { deletedAt: _, values, ...rest } = row;
  return clone({
    ...rest,
    values: values
      .filter((v) => !v.deletedAt)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ deletedAt: _d, ...v }) => v),
  });
}

/**
 * Tells whether a product can be ordered: not deleted, switched on, and every
 * required option group still has enough values on sale (BR-19). Combos and
 * O-1 use it too, so a sold-out required option hides them as well.
 *
 * @param p - product row, or `undefined` when it was not found
 * @returns `true` when the product is on sale
 */
export function productSellable(p: ProductRow | undefined): boolean {
  if (!p || p.deletedAt || !p.isAvailable) return false;
  return optionsSellable(groupsOf(p, liveGroups().map(toGroup)));
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
    row.items.every((i) =>
      productSellable(db.products.find((x) => x.id === i.productId)),
    );
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
 * Tells whether an order already used an option value, which decides between
 * soft and hard delete (BR-19).
 *
 * @param valueId - option value id
 */
function valueWasSold(valueId: number) {
  return db.orders.some((o) =>
    o.items.some((i) => i.options.some((x) => x.optionValueId === valueId)),
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
 * Finds an option group that is not deleted.
 *
 * @param id - option group id
 * @throws {ApiError} 404 `NOT_FOUND`
 */
function findOptionGroup(id: number) {
  const g = db.optionGroups.find((x) => x.id === id && !x.deletedAt);
  if (!g) fail(404, "NOT_FOUND", "Không tìm thấy nhóm tuỳ chọn");
  return g;
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
  if (new Set(input.optionGroupIds).size !== input.optionGroupIds.length)
    fail(400, "VALIDATION", "Một nhóm tuỳ chọn bị gắn hai lần");
  input.optionGroupIds.forEach(findOptionGroup);
  const name = input.name.trim().toLowerCase();
  if (
    liveProducts().some((p) => p.id !== selfId && p.name.toLowerCase() === name)
  )
    fail(409, "BR-12", "Tên món đã tồn tại");
}

/**
 * Checks an option group before saving: unique names, a valid
 * `[minSelect, maxSelect]` range and defaults (BR-16), non-negative deltas
 * (BR-17).
 *
 * @param input - group fields with its values
 * @param selfId - id of the group being edited, so its own name is allowed
 * @throws {ApiError} 400 `VALIDATION`, 409 `BR-16` (duplicate name),
 *   422 `BR-16` / `BR-17`
 */
function validateOptionGroup(input: OptionGroupInput, selfId?: number) {
  const name = input.name.trim();
  if (!name) fail(400, "VALIDATION", "Tên nhóm không được để trống");
  if (
    liveGroups().some(
      (g) => g.id !== selfId && g.name.toLowerCase() === name.toLowerCase(),
    )
  )
    fail(409, "BR-16", "Tên nhóm tuỳ chọn đã tồn tại");
  const { selectionType: type, minSelect: min, maxSelect: max, values } = input;
  if (values.length === 0) fail(422, "BR-16", "Nhóm phải có ít nhất 1 giá trị");
  if (values.some((v) => !v.name.trim()))
    fail(400, "VALIDATION", "Tên giá trị không được để trống");
  const names = values.map((v) => v.name.trim().toLowerCase());
  if (new Set(names).size !== names.length)
    fail(409, "BR-16", "Hai giá trị trong nhóm trùng tên");
  if (![min, max].every(Number.isInteger) || min < 0 || max < 1 || min > max)
    fail(
      422,
      "BR-16",
      "Số lựa chọn tối thiểu phải từ 0 và không lớn hơn tối đa",
    );
  if (type === "SINGLE" && max !== 1)
    fail(422, "BR-16", "Nhóm chọn một chỉ cho chọn tối đa 1");
  if (max > values.length)
    fail(422, "BR-16", "Số lựa chọn tối đa vượt số giá trị của nhóm");
  const defaults = values.filter((v) => v.isDefault).length;
  if (type === "MULTIPLE" && defaults > 0)
    fail(422, "BR-16", "Nhóm chọn nhiều không có giá trị mặc định");
  if (type === "SINGLE" && defaults > 1)
    fail(422, "BR-16", "Nhóm chọn một chỉ có tối đa 1 giá trị mặc định");
  if (type === "SINGLE" && min === 1 && defaults !== 1)
    fail(
      422,
      "BR-16",
      "Nhóm bắt buộc chọn một phải có đúng 1 giá trị mặc định",
    );
  for (const v of values)
    if (
      ![v.priceDelta, v.costDelta].every(Number.isInteger) ||
      v.priceDelta < 0 ||
      v.costDelta < 0
    )
      fail(
        422,
        "BR-17",
        "Giá chênh và giá vốn chênh phải là số nguyên không âm",
      );
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
   * (BR-13, BR-19).
   *
   * @param q - optional search text, matched against name and description
   * @returns categories, products, combos and the option groups; sold-out
   *   values stay in the groups with `isAvailable: false`
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
        .filter((p) => productSellable(p) && match(p))
        .map(stripDeleted),
      combos: liveCombos()
        .map(toCombo)
        .filter((c) => c.sellable && match(c)),
      optionGroups: liveGroups().map(toGroup),
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
   * C-15: option groups with their values and how many products use each.
   * Staff and managers.
   *
   * @returns the groups by `sortOrder`
   */
  async listOptionGroups(): Promise<OptionGroup[]> {
    await delay();
    requireActor(["STAFF", "MANAGER"]);
    return liveGroups().map((g) => ({
      ...toGroup(g),
      productCount: liveProducts().filter((p) =>
        p.optionGroupIds.includes(g.id),
      ).length,
    }));
  },

  /**
   * C-16: creates an option group with its values. Managers only.
   *
   * @param input - group fields and values
   * @returns the saved group
   * @throws {ApiError} 400 `VALIDATION`, 409 `BR-16`, 422 `BR-16` / `BR-17`
   */
  async createOptionGroup(input: OptionGroupInput): Promise<OptionGroup> {
    await delay();
    requireActor(["MANAGER"]);
    validateOptionGroup(input);
    const row: OptionGroupRow = {
      ...clone(input),
      name: input.name.trim(),
      id: nextId(),
      deletedAt: null,
      values: input.values.map((v, i) => ({
        ...v,
        name: v.name.trim(),
        id: nextId(),
        sortOrder: i,
        isAvailable: true,
        deletedAt: null,
      })),
    };
    db.optionGroups.push(row);
    return toGroup(row);
  },

  /**
   * C-17: updates a group and its values. Values with an id are edited, new
   * ones added, missing ones removed: soft delete when an order already used
   * them (BR-19). Delta changes go to audit_log on the backend (BR-17).
   * Managers only.
   *
   * @param id - option group id
   * @param input - group fields and the full list of values
   * @returns the saved group
   * @throws {ApiError} 404 `NOT_FOUND`, 400 `VALIDATION`, 409 `BR-16`,
   *   422 `BR-16` / `BR-17`
   */
  async updateOptionGroup(
    id: number,
    input: OptionGroupInput,
  ): Promise<OptionGroup> {
    await delay();
    const g = findOptionGroup(id);
    requireActor(["MANAGER"]);
    validateOptionGroup(input, id);
    const now = iso(mockNow());
    const kept = new Set(input.values.map((v) => v.id).filter(Boolean));
    const values = g.values.filter((v) => {
      if (v.deletedAt || kept.has(v.id)) return true;
      if (!valueWasSold(v.id)) return false;
      v.deletedAt = now;
      return true;
    });
    input.values.forEach((v, i) => {
      const existing = v.id && values.find((x) => x.id === v.id);
      const fields = { ...v, name: v.name.trim(), sortOrder: i };
      if (existing) Object.assign(existing, fields);
      else
        values.push({
          ...fields,
          id: nextId(),
          isAvailable: true,
          deletedAt: null,
        });
    });
    Object.assign(g, {
      name: input.name.trim(),
      selectionType: input.selectionType,
      minSelect: input.minSelect,
      maxSelect: input.maxSelect,
      sortOrder: input.sortOrder,
      values,
    });
    return toGroup(g);
  },

  /**
   * C-18: deletes an option group; soft delete when one of its values was
   * sold (BR-19). Managers only.
   *
   * @param id - option group id
   * @throws {ApiError} 404 `NOT_FOUND`, 422 `BR-19` while a product uses it
   */
  async deleteOptionGroup(id: number): Promise<void> {
    await delay();
    const g = findOptionGroup(id);
    requireActor(["MANAGER"]);
    const used = liveProducts().filter((p) => p.optionGroupIds.includes(id));
    if (used.length)
      fail(
        422,
        "BR-19",
        `Nhóm đang gắn vào ${used.length} món, hãy gỡ khỏi món trước`,
      );
    if (g.values.some((v) => valueWasSold(v.id))) g.deletedAt = iso(mockNow());
    else db.optionGroups.splice(db.optionGroups.indexOf(g), 1);
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
  async setOptionValueAvailability(
    valueId: number,
    isAvailable: boolean,
  ): Promise<OptionValue> {
    await delay();
    requireActor(["STAFF", "MANAGER"]);
    const v = liveGroups()
      .flatMap((g) => g.values)
      .find((x) => x.id === valueId && !x.deletedAt);
    if (!v) fail(404, "NOT_FOUND", "Không tìm thấy tuỳ chọn");
    v.isAvailable = isAvailable;
    const { deletedAt: _, ...rest } = v;
    return clone(rest);
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
