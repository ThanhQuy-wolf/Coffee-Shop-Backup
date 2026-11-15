// S-2 → S-5 in docs/05-api.md. There is only one shop (A-5).
import type { ShopInfo, ShopSettings } from "../types";
import { apiRequest } from "./client";

export const shopService = {
  /**
   * S-2: reads the shop's public information.
   *
   * @returns name, address, opening hours, wifi and social links
   */
  get(): Promise<ShopInfo> {
    return apiRequest<ShopInfo>("GET", "/v1/shop");
  },

  /**
   * S-3: replaces the shop's information.
   *
   * @param data - every field of the shop
   * @returns the saved information
   * @throws {ApiError} 400 `VALIDATION` for an empty name; 403 for non-managers
   */
  update(data: ShopInfo): Promise<ShopInfo> {
    return apiRequest<ShopInfo>("PUT", "/v1/shop", data);
  },

  /**
   * S-4: reads the parameters P-06, P-08 → P-12.
   *
   * @returns the current settings
   * @throws {ApiError} 403 for non-managers
   */
  getSettings(): Promise<ShopSettings> {
    return apiRequest<ShopSettings>("GET", "/v1/shop/settings");
  },

  /**
   * S-5: changes the parameters.
   *
   * @param data - all six parameters
   * @returns the saved settings
   * @throws {ApiError} 400 `VALIDATION` when a value is out of range
   */
  updateSettings(data: ShopSettings): Promise<ShopSettings> {
    return apiRequest<ShopSettings>("PUT", "/v1/shop/settings", data);
  },
};
