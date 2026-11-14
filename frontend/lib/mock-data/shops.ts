import type { Department, ShopInfo, ShopSettings } from "../types";

/** Seed row of shop_info (docs/04-erd.md) */
export const MOCK_SHOP_INFO: ShopInfo = {
  name: "Drinkool Coffee",
  tagline: "Hương vị đậm đà – Khoảnh khắc thư giãn",
  address: "86 Cao Thắng, Quận 3, TP. Hồ Chí Minh",
  phone: "0901 234 567",
  email: "contact@drinkool.vn",
  logoUrl: "/imgs/logo.png",
  coverImageUrl:
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=400&fit=crop",
  openHours: "07:00 – 22:00 (Thứ 2 – Chủ nhật)",
  wifiName: "Drinkool_Free",
  wifiPassword: "coffee2024",
  socialLinks: {
    facebook: "https://facebook.com/drinkool",
    tiktok: "https://tiktok.com/@drinkool",
  },
};

/** Suggested values from docs/02-business-rules.md §2 */
export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  paymentTimeoutMinutes: 15,
  maxItemQuantity: 20,
  reviewWindowDays: 7,
  shiftCancelHours: 12,
  attendanceEditDays: 3,
  shiftBookingDays: 14,
};

export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 1,
    code: "bar",
    name: "Pha chế",
    icon: "fa-solid fa-martini-glass-citrus",
  },
  {
    id: 2,
    code: "kitchen",
    name: "Bếp",
    icon: "fa-solid fa-kitchen-set",
  },
  {
    id: 3,
    code: "cashier",
    name: "Thu ngân",
    icon: "fa-solid fa-cash-register",
  },
  {
    id: 4,
    code: "janitor",
    name: "Tạp vụ",
    icon: "fa-solid fa-broom",
  },
];
