// ─── Shops service (feed page) ───────────────────────────────────────────────
// Mock data for now — swap for an API call when the backend is ready.
import { MOCK_SHOPS } from "../mock-data/shops";
import type { Shop } from "../types";

export function getShops(): Shop[] {
  return MOCK_SHOPS;
}
