import type { Department, Shop, ShopSettings } from "../types";

const UNSPLASH = "https://images.unsplash.com";

function shop(
  id: number,
  code: string,
  name: string,
  address: string,
  photo: string,
): Shop {
  return {
    id,
    code,
    name,
    tagline: "Hương vị đậm đà – Khoảnh khắc thư giãn",
    address,
    phone: "0901 234 567",
    email: `contact.${code.toLowerCase()}@drinkool.vn`,
    logoUrl: "/imgs/logo.png",
    coverImageUrl: `${UNSPLASH}/${photo}?w=600&h=400&fit=crop`,
    openHours: "07:00 – 22:00 (Thứ 2 – Chủ nhật)",
    wifiName: `${code}_Free`,
    wifiPassword: "coffee2024",
    socialLinks: {
      facebook: "https://facebook.com/drinkool",
      tiktok: "https://tiktok.com/@drinkool",
    },
    isActive: true,
  };
}

export const MOCK_SHOPS: Shop[] = [
  shop(
    1,
    "CF",
    "The Coffee House",
    "86 Cao Thắng, Quận 3, TP. Hồ Chí Minh",
    "photo-1554118811-1e0d58224f24",
  ),
  shop(
    2,
    "HL",
    "Highlands Coffee",
    "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    "photo-1559305616-3f99cd43e353",
  ),
  shop(
    3,
    "PL",
    "Phúc Long Heritage",
    "42 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    "photo-1501339847302-ac426a4a7cbb",
  ),
  shop(
    4,
    "KT",
    "Katinat Saigon Kafe",
    "26 Lý Tự Trọng, Quận 1, TP. Hồ Chí Minh",
    "photo-1495474472287-4d71bcdd2085",
  ),
  shop(
    5,
    "TN",
    "Trung Nguyên E-Coffee",
    "15 Hai Bà Trưng, Quận 1, TP. Hồ Chí Minh",
    "photo-1453614512568-c4024d13c247",
  ),
  // Paused shop: kept to show that inactive shops are hidden from /feed (BR-05)
  {
    ...shop(
      6,
      "OL",
      "Ông Bầu (tạm đóng)",
      "9 Pasteur, Quận 1, TP. Hồ Chí Minh",
      "photo-1453614512568-c4024d13c247",
    ),
    isActive: false,
  },
];

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
    shopId: 1,
    code: "bar",
    name: "Pha chế",
    icon: "fa-solid fa-martini-glass-citrus",
  },
  {
    id: 2,
    shopId: 1,
    code: "kitchen",
    name: "Bếp",
    icon: "fa-solid fa-kitchen-set",
  },
  {
    id: 3,
    shopId: 1,
    code: "cashier",
    name: "Thu ngân",
    icon: "fa-solid fa-cash-register",
  },
  {
    id: 4,
    shopId: 1,
    code: "janitor",
    name: "Tạp vụ",
    icon: "fa-solid fa-broom",
  },
];
