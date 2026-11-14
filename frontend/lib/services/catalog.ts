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
  requireShopStaff,
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

/** "Tất cả" pseudo-category used by the menu filters */
export const ALL_CATEGORY_ID = 0;

const liveProducts = (shopId: number) =>
  db.products.filter((p) => p.shopId === shopId && !p.deletedAt);
const liveCombos = (shopId: number) =>
  db.combos.filter((c) => c.shopId === shopId && !c.deletedAt);

function stripDeleted<T extends { deletedAt: string | null }>(row: T) {
  const { deletedAt: _, ...rest } = row;
  return clone(rest);
}

/** BR-13: a combo is on sale only when every component product is. */
function toCombo(row: ComboRow): Combo {
  const sellable =
    row.isAvailable &&
    row.items.every((i) => {
      const p = db.products.find((x) => x.id === i.productId);
      return !!p && !p.deletedAt && p.isAvailable;
    });
  return { ...stripDeleted(row), sellable };
}

function wasSold(type: "PRODUCT" | "COMBO", id: number) {
  return db.orders.some((o) =>
    o.items.some((i) => i.type === type && i.id === id),
  );
}

function findCategory(id: number) {
  const c = db.categories.find((x) => x.id === id && !x.deletedAt);
  if (!c) fail(404, "NOT_FOUND", "Không tìm thấy danh mục");
  return c;
}
function findProduct(id: number) {
  const p = db.products.find((x) => x.id === id && !x.deletedAt);
  if (!p) fail(404, "NOT_FOUND", "Không tìm thấy món");
  return p;
}
function findCombo(id: number) {
  const c = db.combos.find((x) => x.id === id && !x.deletedAt);
  if (!c) fail(404, "NOT_FOUND", "Không tìm thấy combo");
  return c;
}

/** BR-10, BR-12 */
function validateProduct(shopId: number, input: ProductInput, selfId?: number) {
  if (!input.name.trim())
    fail(400, "VALIDATION", "Tên món không được để trống");
  if (!Number.isInteger(input.price) || input.price <= 0)
    fail(422, "BR-10", "Giá bán phải là số nguyên lớn hơn 0");
  if (!Number.isInteger(input.costPrice) || input.costPrice < 0)
    fail(422, "BR-10", "Giá vốn phải là số nguyên không âm");
  const category = findCategory(input.categoryId);
  if (category.shopId !== shopId)
    fail(403, "BR-03", "Danh mục không thuộc quán");
  const name = input.name.trim().toLowerCase();
  if (
    liveProducts(shopId).some(
      (p) => p.id !== selfId && p.name.toLowerCase() === name,
    )
  )
    fail(409, "BR-12", "Tên món đã tồn tại trong quán");
}

/** BR-13 */
function validateCombo(shopId: number, input: ComboInput) {
  if (!input.name.trim())
    fail(400, "VALIDATION", "Tên combo không được để trống");
  if (!Number.isInteger(input.price) || input.price <= 0)
    fail(422, "BR-10", "Giá combo phải là số nguyên lớn hơn 0");
  const totalQty = input.items.reduce((s, i) => s + i.quantity, 0);
  if (totalQty < 2) fail(422, "BR-13", "Combo phải có ít nhất 2 món");
  for (const item of input.items) {
    if (findProduct(item.productId).shopId !== shopId)
      fail(422, "BR-13", "Món trong combo phải thuộc cùng quán");
  }
}

export const catalogService = {
  /** S-6 — what customers see: only items on sale (BR-05, BR-13) */
  async getMenu(shopId: number, q?: string): Promise<Menu> {
    await delay();
    const shop = db.shops.find((s) => s.id === shopId && s.isActive);
    if (!shop) fail(404, "NOT_FOUND", "Quán không tồn tại hoặc đang tạm đóng");
    const query = q?.trim().toLowerCase() ?? "";
    const match = (x: { name: string; description: string }) =>
      !query ||
      x.name.toLowerCase().includes(query) ||
      x.description.toLowerCase().includes(query);
    return {
      shop: clone(shop),
      categories: db.categories
        .filter((c) => c.shopId === shopId && !c.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(stripDeleted),
      products: liveProducts(shopId)
        .filter((p) => p.isAvailable && match(p))
        .map(stripDeleted),
      combos: liveCombos(shopId)
        .map(toCombo)
        .filter((c) => c.sellable && match(c)),
    };
  },

  /** C-1 */
  async listCategories(shopId: number): Promise<MenuCategory[]> {
    await delay();
    requireShopStaff(shopId);
    return db.categories
      .filter((c) => c.shopId === shopId && !c.deletedAt)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({
        ...stripDeleted(c),
        productCount: liveProducts(shopId).filter((p) => p.categoryId === c.id)
          .length,
      }));
  },

  /** C-2 */
  async createCategory(
    shopId: number,
    input: CategoryInput,
  ): Promise<MenuCategory> {
    await delay();
    requireShopStaff(shopId, ["MANAGER"]);
    if (!input.name.trim())
      fail(400, "VALIDATION", "Tên danh mục không được để trống");
    const row = { ...input, id: nextId(), shopId, deletedAt: null };
    db.categories.push(row);
    return { ...stripDeleted(row), productCount: 0 };
  },

  /** C-3 */
  async updateCategory(
    id: number,
    input: CategoryInput,
  ): Promise<MenuCategory> {
    await delay();
    const c = findCategory(id);
    requireShopStaff(c.shopId, ["MANAGER"]);
    Object.assign(c, input);
    return stripDeleted(c);
  },

  /** C-4 — soft delete, only when empty (BR-11) */
  async deleteCategory(id: number): Promise<void> {
    await delay();
    const c = findCategory(id);
    requireShopStaff(c.shopId, ["MANAGER"]);
    const count = liveProducts(c.shopId).filter(
      (p) => p.categoryId === id,
    ).length;
    if (count > 0)
      fail(
        422,
        "BR-11",
        `Danh mục còn ${count} món, hãy chuyển món sang danh mục khác trước`,
      );
    c.deletedAt = iso(mockNow());
  },

  /** C-5 */
  async listProducts(shopId: number, categoryId?: number): Promise<Product[]> {
    await delay();
    requireShopStaff(shopId);
    return liveProducts(shopId)
      .filter((p) => !categoryId || p.categoryId === categoryId)
      .map(stripDeleted);
  },

  /** C-6 */
  async createProduct(shopId: number, input: ProductInput): Promise<Product> {
    await delay();
    requireShopStaff(shopId, ["MANAGER"]);
    validateProduct(shopId, input);
    const row = {
      ...input,
      name: input.name.trim(),
      id: nextId(),
      shopId,
      deletedAt: null,
    };
    db.products.push(row);
    return stripDeleted(row);
  },

  /** C-7 — price changes go to audit_log on the backend (BR-15) */
  async updateProduct(id: number, input: ProductInput): Promise<Product> {
    await delay();
    const p = findProduct(id);
    requireShopStaff(p.shopId, ["MANAGER"]);
    validateProduct(p.shopId, input, id);
    Object.assign(p, input, { name: input.name.trim() });
    return stripDeleted(p);
  },

  /** C-8 — staff may switch off an item that ran out */
  async setProductAvailability(
    id: number,
    isAvailable: boolean,
  ): Promise<Product> {
    await delay();
    const p = findProduct(id);
    requireShopStaff(p.shopId);
    p.isAvailable = isAvailable;
    return stripDeleted(p);
  },

  /** C-9 — BR-14 */
  async deleteProduct(id: number): Promise<void> {
    await delay();
    const p = findProduct(id);
    requireShopStaff(p.shopId, ["MANAGER"]);
    if (
      liveCombos(p.shopId).some((c) => c.items.some((i) => i.productId === id))
    )
      fail(422, "BR-13", "Món đang nằm trong combo, hãy gỡ khỏi combo trước");
    if (wasSold("PRODUCT", id)) p.deletedAt = iso(mockNow());
    else db.products.splice(db.products.indexOf(p), 1);
  },

  /** C-10 */
  async listCombos(shopId: number): Promise<Combo[]> {
    await delay();
    requireShopStaff(shopId);
    return liveCombos(shopId).map(toCombo);
  },

  /** C-11 */
  async createCombo(shopId: number, input: ComboInput): Promise<Combo> {
    await delay();
    requireShopStaff(shopId, ["MANAGER"]);
    validateCombo(shopId, input);
    const row: ComboRow = {
      ...clone(input),
      id: nextId(),
      shopId,
      deletedAt: null,
    };
    db.combos.push(row);
    return toCombo(row);
  },

  /** C-12 */
  async updateCombo(id: number, input: ComboInput): Promise<Combo> {
    await delay();
    const c = findCombo(id);
    requireShopStaff(c.shopId, ["MANAGER"]);
    validateCombo(c.shopId, input);
    Object.assign(c, clone(input));
    return toCombo(c);
  },

  /** C-13 */
  async setComboAvailability(id: number, isAvailable: boolean): Promise<Combo> {
    await delay();
    const c = findCombo(id);
    requireShopStaff(c.shopId, ["MANAGER"]);
    c.isAvailable = isAvailable;
    return toCombo(c);
  },

  /** C-14 — BR-14 */
  async deleteCombo(id: number): Promise<void> {
    await delay();
    const c = findCombo(id);
    requireShopStaff(c.shopId, ["MANAGER"]);
    if (wasSold("COMBO", id)) c.deletedAt = iso(mockNow());
    else db.combos.splice(db.combos.indexOf(c), 1);
  },
};
