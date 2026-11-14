// S-2 → S-5 in docs/05-api.md. There is only one shop (A-5).
import { clone, db, delay, fail, requireActor } from "../mock-data/db";
import type { ShopInfo, ShopSettings } from "../types";

export const shopService = {
  /** S-2 */
  async get(): Promise<ShopInfo> {
    await delay();
    return clone(db.shop);
  },

  /** S-3 */
  async update(data: ShopInfo): Promise<ShopInfo> {
    await delay();
    requireActor(["MANAGER"]);
    if (!data.name.trim())
      fail(400, "VALIDATION", "Tên quán không được để trống");
    db.shop = clone(data);
    return clone(db.shop);
  },

  /** S-4 */
  async getSettings(): Promise<ShopSettings> {
    await delay();
    requireActor(["MANAGER"]);
    return { ...db.settings };
  },

  /** S-5 */
  async updateSettings(data: ShopSettings): Promise<ShopSettings> {
    await delay();
    requireActor(["MANAGER"]);
    if (Object.values(data).some((v) => !Number.isInteger(v) || v < 0))
      fail(400, "VALIDATION", "Tham số phải là số nguyên không âm");
    if (data.paymentTimeoutMinutes < 1 || data.maxItemQuantity < 1)
      fail(
        400,
        "VALIDATION",
        "Thời hạn thanh toán và số lượng tối đa phải lớn hơn 0",
      );
    db.settings = { ...data };
    return { ...data };
  },
};
