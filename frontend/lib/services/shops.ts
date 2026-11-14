// S-2 → S-5 in docs/05-api.md. There is only one shop (A-5).
import { clone, db, delay, fail, requireActor } from "../mock-data/db";
import type { ShopInfo, ShopSettings } from "../types";

export const shopService = {
  /**
   * S-2: reads the shop's public info (name, address, hours, WiFi...).
   *
   * @returns the `shop_info` row
   */
  async get(): Promise<ShopInfo> {
    await delay();
    return clone(db.shop);
  },

  /**
   * S-3: updates the shop's info. Managers only.
   *
   * @param data - all info fields
   * @returns the saved info
   * @throws {ApiError} 400 `VALIDATION` for an empty name, 403 for other roles
   */
  async update(data: ShopInfo): Promise<ShopInfo> {
    await delay();
    requireActor(["MANAGER"]);
    if (!data.name.trim())
      fail(400, "VALIDATION", "Tên quán không được để trống");
    db.shop = clone(data);
    return clone(db.shop);
  },

  /**
   * S-4: reads the business parameters P-06, P-08 → P-12. Managers only.
   *
   * @returns current parameters
   */
  async getSettings(): Promise<ShopSettings> {
    await delay();
    requireActor(["MANAGER"]);
    return { ...db.settings };
  },

  /**
   * S-5: updates the business parameters. New values apply to orders and
   * shifts created afterwards. Managers only.
   *
   * @param data - all parameters, non-negative integers
   * @returns the saved parameters
   * @throws {ApiError} 400 `VALIDATION` for invalid numbers
   */
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
