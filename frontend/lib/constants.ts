// ─── App-wide constants (real config, not mock data) ─────────────────────────
// Mock data used until the backend is ready lives in lib/mock-data/.
import type { Department, ShopInfo, SocialLinks } from "./types";

// ===== SHOP INFORMATION =====
export const SHOP_INFO: ShopInfo = {
  name: "Coffee Shop",
  tagline: "Hương vị đậm đà – Khoảnh khắc thư giãn",
  logo: "/imgs/logo.png",
  address: "123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
  phone: "0901 234 567",
  managerPhone: "0912 345 678",
  email: "contact@coffeeshop.vn",
  wifi: {
    name: "CoffeeShop_Free",
    password: "coffee2024",
  },
  openHours: "07:00 – 22:00 (Thứ 2 – Chủ nhật)",
};

// ===== SOCIAL LINKS =====
export const SOCIAL_LINKS: SocialLinks = {
  facebook: "https://facebook.com/coffeeshop",
  tiktok: "https://tiktok.com/@coffeeshop",
  website: "/",
};

// ===== SHIFT DEPARTMENTS =====
export const DEPARTMENTS: Department[] = [
  { id: "bar", name: "Bar Staff", icon: "fa-solid fa-martini-glass-citrus" },
  { id: "kitchen", name: "Kitchen", icon: "fa-solid fa-kitchen-set" },
  { id: "cashier", name: "Cashier", icon: "fa-solid fa-cash-register" },
  { id: "janitor", name: "Janitor", icon: "fa-solid fa-broom" },
];
