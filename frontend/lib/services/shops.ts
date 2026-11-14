// S-1 → S-5 in docs/05-api.md
import {
  clone,
  db,
  delay,
  fail,
  requireShopStaff,
  settingsOf,
} from "../mock-data/db";
import type { Shop, ShopSettings, ShopUpdate } from "../types";

function findShop(shopId: number): Shop {
  const shop = db.shops.find((s) => s.id === shopId);
  if (!shop) fail(404, "NOT_FOUND", "Không tìm thấy quán");
  return shop;
}

const includes = (text: string, q?: string) =>
  !q?.trim() || text.toLowerCase().includes(q.trim().toLowerCase());

export const shopService = {
  /** S-1 — active shops only (BR-05) */
  async list(filter: { q?: string; address?: string } = {}): Promise<Shop[]> {
    await delay();
    return clone(
      db.shops.filter(
        (s) =>
          s.isActive &&
          includes(s.name, filter.q) &&
          includes(s.address, filter.address),
      ),
    );
  },

  /** S-2 */
  async get(shopId: number): Promise<Shop> {
    await delay();
    return clone(findShop(shopId));
  },

  /** S-3 */
  async update(shopId: number, data: ShopUpdate): Promise<Shop> {
    await delay();
    requireShopStaff(shopId, ["MANAGER"]);
    const shop = findShop(shopId);
    if (!data.name.trim())
      fail(400, "VALIDATION", "Tên quán không được để trống");
    Object.assign(shop, data);
    return clone(shop);
  },

  /** S-4 */
  async getSettings(shopId: number): Promise<ShopSettings> {
    await delay();
    requireShopStaff(shopId, ["MANAGER"]);
    return { ...settingsOf(shopId) };
  },

  /** S-5 */
  async updateSettings(
    shopId: number,
    data: ShopSettings,
  ): Promise<ShopSettings> {
    await delay();
    requireShopStaff(shopId, ["MANAGER"]);
    if (Object.values(data).some((v) => !Number.isInteger(v) || v < 0))
      fail(400, "VALIDATION", "Tham số phải là số nguyên không âm");
    if (data.paymentTimeoutMinutes < 1 || data.maxItemQuantity < 1)
      fail(
        400,
        "VALIDATION",
        "Thời hạn thanh toán và số lượng tối đa phải lớn hơn 0",
      );
    db.settings.set(shopId, { ...data });
    return { ...data };
  },
};
