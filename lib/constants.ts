import type {
  Combo,
  Department,
  MenuCategory,
  Product,
  ProductSalesStats,
  RevenueDataPoint,
  ShiftSlot,
  Shop,
  ShopInfo,
  SocialLinks,
  User,
} from "./types";

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

// ===== MENU CATEGORIES =====
// Each category has a unique FontAwesome icon representing the item type
export const MENU_CATEGORIES: MenuCategory[] = [
  { id: "all", name: "Tất cả", icon: "fa-solid fa-border-all" },
  { id: "cafe", name: "Cà Phê", icon: "fa-solid fa-mug-hot" },
  { id: "tra", name: "Trà", icon: "fa-solid fa-leaf" },
  { id: "sua-chua", name: "Sữa Chua", icon: "fa-solid fa-jar" },
  { id: "nuoc-ep", name: "Nước Ép", icon: "fa-solid fa-blender" },
  { id: "latte", name: "Latte", icon: "fa-solid fa-mug-saucer" },
  {
    id: "giai-khat",
    name: "Giải Khát / Ăn Vặt",
    icon: "fa-solid fa-ice-cream",
  },
  { id: "topping", name: "Topping", icon: "fa-solid fa-layer-group" },
];

// ===== MOCK PRODUCTS =====
// Placeholder data – replace with real API calls when backend is ready
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Cà Phê Đen",
    category: "cafe",
    price: 25000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Cà phê đen truyền thống, đậm đà hương vị Việt Nam, pha phin thủ công.",
    available: true,
  },
  {
    id: 2,
    name: "Cà Phê Sữa",
    category: "cafe",
    price: 30000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Cà phê sữa đặc thơm ngon, béo ngậy, kết hợp hoàn hảo giữa cà phê và sữa đặc.",
    available: true,
  },
  {
    id: 3,
    name: "Bạc Xỉu",
    category: "cafe",
    price: 32000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Bạc xỉu nhẹ nhàng, ít cà phê nhiều sữa, thích hợp cho người mới uống cà phê.",
    available: true,
  },
  {
    id: 4,
    name: "Cà Phê Trứng",
    category: "cafe",
    price: 45000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Cà phê trứng đặc sản Hà Nội, lớp kem trứng mịn màng phủ trên nền cà phê đậm đà.",
    available: true,
  },
  {
    id: 5,
    name: "Trà Đào Cam Sả",
    category: "tra",
    price: 35000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Trà đào thơm mát kết hợp cam tươi và sả, thanh mát và giải nhiệt tuyệt vời.",
    available: true,
  },
  {
    id: 6,
    name: "Trà Xanh Matcha",
    category: "tra",
    price: 40000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Matcha Nhật Bản nguyên chất, vị đắng nhẹ đặc trưng, thơm mát và bổ dưỡng.",
    available: true,
  },
  {
    id: 7,
    name: "Trà Vải Hoa Nhài",
    category: "tra",
    price: 38000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Trà vải thanh ngọt kết hợp hương hoa nhài dịu dàng, thư giãn tâm hồn.",
    available: true,
  },
  {
    id: 8,
    name: "Sữa Chua Trân Châu",
    category: "sua-chua",
    price: 38000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Sữa chua mịn màng kết hợp trân châu đen dẻo dai, chua ngọt hài hòa.",
    available: true,
  },
  {
    id: 9,
    name: "Sữa Chua Dâu",
    category: "sua-chua",
    price: 40000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Sữa chua mát lạnh với dâu tươi ngọt chua, giàu vitamin và khoáng chất.",
    available: true,
  },
  {
    id: 10,
    name: "Nước Ép Cam",
    category: "nuoc-ep",
    price: 35000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Nước ép cam tươi nguyên chất, giàu vitamin C, tốt cho sức khỏe.",
    available: true,
  },
  {
    id: 11,
    name: "Nước Ép Dưa Hấu",
    category: "nuoc-ep",
    price: 30000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Nước ép dưa hấu mát lạnh, giải nhiệt tức thì trong những ngày hè oi bức.",
    available: true,
  },
  {
    id: 12,
    name: "Latte Caramel",
    category: "latte",
    price: 45000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Latte caramel ngọt ngào, thơm béo với lớp foam sữa mịn và sốt caramel.",
    available: true,
  },
  {
    id: 13,
    name: "Latte Vanilla",
    category: "latte",
    price: 45000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Latte vanilla nhẹ nhàng, hương thơm dịu dàng từ vanilla tự nhiên.",
    available: true,
  },
  {
    id: 14,
    name: "Bánh Mì Nướng Bơ",
    category: "giai-khat",
    price: 20000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Bánh mì nướng giòn rụm, phết bơ thơm và mứt dâu, ăn kèm cà phê tuyệt vời.",
    available: true,
  },
  {
    id: 15,
    name: "Bánh Flan",
    category: "giai-khat",
    price: 25000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Bánh flan mềm mịn, ngọt ngào với lớp caramel vàng óng, tan chảy trong miệng.",
    available: true,
  },
  {
    id: 16,
    name: "Trân Châu Đen",
    category: "topping",
    price: 10000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Trân châu đen dẻo dai, thêm vào bất kỳ đồ uống nào để tăng thêm hương vị.",
    available: true,
  },
  {
    id: 17,
    name: "Thạch Cà Phê",
    category: "topping",
    price: 10000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Thạch cà phê mát lạnh, thêm hương vị đặc biệt cho đồ uống của bạn.",
    available: true,
  },
  {
    id: 18,
    name: "Trân Châu Trắng",
    category: "topping",
    price: 10000,
    image: "/imgs/products/placeholder.jpg",
    description:
      "Trân châu trắng dẻo dai, thêm vào bất kỳ đồ uống nào để tăng thêm hương vị.",
    available: true,
  },
];

// ===== MOCK COMBOS =====
export const MOCK_COMBOS: Combo[] = [
  {
    id: 1,
    name: "Combo Cà Phê Đôi",
    description: "2 ly cà phê đen + 2 bánh mì nướng bơ, tiết kiệm 15%.",
    price: 75000,
    image: "/imgs/products/placeholder.jpg",
    items: [
      { productId: 1, quantity: 2 },
      { productId: 14, quantity: 2 },
    ],
    available: true,
  },
  {
    id: 2,
    name: "Combo Trà Sữa Nhóm",
    description: "2 trà đào cam sả + 2 trà xanh matcha, dành cho nhóm bạn.",
    price: 130000,
    image: "/imgs/products/placeholder.jpg",
    items: [
      { productId: 5, quantity: 2 },
      { productId: 6, quantity: 2 },
    ],
    available: true,
  },
  {
    id: 3,
    name: "Combo Buổi Sáng",
    description: "1 cà phê sữa + 1 bánh flan, khởi đầu ngày mới ngọt ngào.",
    price: 48000,
    image: "/imgs/products/placeholder.jpg",
    items: [
      { productId: 2, quantity: 1 },
      { productId: 15, quantity: 1 },
    ],
    available: false,
  },
];

// ===== MOCK SHOPS (for Feed page) =====
export const MOCK_SHOPS: Shop[] = [
  {
    id: 1,
    name: "The Coffee House",
    address: "86 Cao Thắng, Quận 3, TP. Hồ Chí Minh",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Highlands Coffee",
    address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    image:
      "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Phúc Long Heritage",
    address: "42 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Katinat Saigon Kafe",
    address: "26 Lý Tự Trọng, Quận 1, TP. Hồ Chí Minh",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    name: "Trung Nguyên E-Coffee",
    address: "15 Hai Bà Trưng, Quận 1, TP. Hồ Chí Minh",
    image:
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600&h=400&fit=crop",
  },
];

// ===== MOCK FINANCIAL DATA =====

// Daily revenue for the last 30 days (current month)
export const MOCK_REVENUE_DAILY: RevenueDataPoint[] = [
  { label: "01/04", revenue: 1250000, orders: 42 },
  { label: "02/04", revenue: 980000, orders: 35 },
  { label: "03/04", revenue: 1540000, orders: 55 },
  { label: "04/04", revenue: 1120000, orders: 40 },
  { label: "05/04", revenue: 1890000, orders: 68 },
  { label: "06/04", revenue: 2100000, orders: 74 },
  { label: "07/04", revenue: 2350000, orders: 82 },
  { label: "08/04", revenue: 1680000, orders: 60 },
  { label: "09/04", revenue: 1430000, orders: 50 },
  { label: "10/04", revenue: 1750000, orders: 63 },
  { label: "11/04", revenue: 1560000, orders: 56 },
  { label: "12/04", revenue: 1920000, orders: 70 },
  { label: "13/04", revenue: 2230000, orders: 80 },
  { label: "14/04", revenue: 2480000, orders: 90 },
  { label: "15/04", revenue: 1870000, orders: 66 },
  { label: "16/04", revenue: 1340000, orders: 48 },
  { label: "17/04", revenue: 1610000, orders: 58 },
  { label: "18/04", revenue: 1490000, orders: 53 },
  { label: "19/04", revenue: 1970000, orders: 71 },
  { label: "20/04", revenue: 2140000, orders: 77 },
  { label: "21/04", revenue: 2560000, orders: 93 },
  { label: "22/04", revenue: 1780000, orders: 64 },
  { label: "23/04", revenue: 1520000, orders: 54 },
  { label: "24/04", revenue: 1840000, orders: 66 },
  { label: "25/04", revenue: 1660000, orders: 60 },
  { label: "26/04", revenue: 2050000, orders: 74 },
  { label: "27/04", revenue: 2280000, orders: 82 },
  { label: "28/04", revenue: 2490000, orders: 89 },
  { label: "29/04", revenue: 1950000, orders: 70 },
  { label: "30/04", revenue: 1720000, orders: 62 },
];

// Weekly revenue (last 12 weeks)
export const MOCK_REVENUE_WEEKLY: RevenueDataPoint[] = [
  { label: "T1/W1", revenue: 8200000, orders: 295 },
  { label: "T1/W2", revenue: 9450000, orders: 340 },
  { label: "T1/W3", revenue: 10100000, orders: 362 },
  { label: "T1/W4", revenue: 8750000, orders: 315 },
  { label: "T2/W1", revenue: 9200000, orders: 330 },
  { label: "T2/W2", revenue: 10500000, orders: 378 },
  { label: "T2/W3", revenue: 11200000, orders: 400 },
  { label: "T2/W4", revenue: 9800000, orders: 352 },
  { label: "T3/W1", revenue: 10400000, orders: 374 },
  { label: "T3/W2", revenue: 11800000, orders: 424 },
  { label: "T3/W3", revenue: 12500000, orders: 448 },
  { label: "T3/W4", revenue: 10900000, orders: 392 },
];

// Monthly revenue (last 12 months)
export const MOCK_REVENUE_MONTHLY: RevenueDataPoint[] = [
  { label: "T4/2025", revenue: 42000000, orders: 1512 },
  { label: "T5/2025", revenue: 45500000, orders: 1638 },
  { label: "T6/2025", revenue: 48000000, orders: 1728 },
  { label: "T7/2025", revenue: 52000000, orders: 1872 },
  { label: "T8/2025", revenue: 49500000, orders: 1782 },
  { label: "T9/2025", revenue: 46800000, orders: 1685 },
  { label: "T10/2025", revenue: 51200000, orders: 1843 },
  { label: "T11/2025", revenue: 55000000, orders: 1980 },
  { label: "T12/2025", revenue: 62000000, orders: 2232 },
  { label: "T1/2026", revenue: 44000000, orders: 1584 },
  { label: "T2/2026", revenue: 47500000, orders: 1710 },
  { label: "T3/2026", revenue: 53500000, orders: 1926 },
];

// Yearly revenue (last 5 years)
export const MOCK_REVENUE_YEARLY: RevenueDataPoint[] = [
  { label: "2022", revenue: 420000000, orders: 15120 },
  { label: "2023", revenue: 485000000, orders: 17460 },
  { label: "2024", revenue: 530000000, orders: 19080 },
  { label: "2025", revenue: 598000000, orders: 21528 },
  { label: "2026", revenue: 180000000, orders: 6480 },
];

// Product sales statistics (with cost price for profit analysis)
export const MOCK_PRODUCT_SALES: ProductSalesStats[] = [
  {
    productId: 12,
    name: "Latte Caramel",
    category: "latte",
    unitsSold: 487,
    revenue: 21915000,
    costPrice: 18000,
    sellingPrice: 45000,
    profit: 13185000,
    profitMargin: 60.2,
  },
  {
    productId: 6,
    name: "Trà Xanh Matcha",
    category: "tra",
    unitsSold: 412,
    revenue: 16480000,
    costPrice: 15000,
    sellingPrice: 40000,
    profit: 10300000,
    profitMargin: 62.5,
  },
  {
    productId: 5,
    name: "Trà Đào Cam Sả",
    category: "tra",
    unitsSold: 398,
    revenue: 13930000,
    costPrice: 12000,
    sellingPrice: 35000,
    profit: 9153000,
    profitMargin: 65.7,
  },
  {
    productId: 13,
    name: "Latte Vanilla",
    category: "latte",
    unitsSold: 356,
    revenue: 16020000,
    costPrice: 18000,
    sellingPrice: 45000,
    profit: 9612000,
    profitMargin: 60.0,
  },
  {
    productId: 4,
    name: "Cà Phê Trứng",
    category: "cafe",
    unitsSold: 340,
    revenue: 15300000,
    costPrice: 16000,
    sellingPrice: 45000,
    profit: 9860000,
    profitMargin: 64.4,
  },
  {
    productId: 2,
    name: "Cà Phê Sữa",
    category: "cafe",
    unitsSold: 325,
    revenue: 9750000,
    costPrice: 10000,
    sellingPrice: 30000,
    profit: 6500000,
    profitMargin: 66.7,
  },
  {
    productId: 3,
    name: "Bạc Xỉu",
    category: "cafe",
    unitsSold: 298,
    revenue: 9536000,
    costPrice: 11000,
    sellingPrice: 32000,
    profit: 6259000,
    profitMargin: 65.6,
  },
  {
    productId: 1,
    name: "Cà Phê Đen",
    category: "cafe",
    unitsSold: 285,
    revenue: 7125000,
    costPrice: 8000,
    sellingPrice: 25000,
    profit: 4845000,
    profitMargin: 68.0,
  },
  {
    productId: 9,
    name: "Sữa Chua Dâu",
    category: "sua-chua",
    unitsSold: 267,
    revenue: 10680000,
    costPrice: 15000,
    sellingPrice: 40000,
    profit: 6675000,
    profitMargin: 62.5,
  },
  {
    productId: 10,
    name: "Nước Ép Cam",
    category: "nuoc-ep",
    unitsSold: 241,
    revenue: 8435000,
    costPrice: 12000,
    sellingPrice: 35000,
    profit: 5543000,
    profitMargin: 65.7,
  },
  {
    productId: 8,
    name: "Sữa Chua Trân Châu",
    category: "sua-chua",
    unitsSold: 228,
    revenue: 8664000,
    costPrice: 14000,
    sellingPrice: 38000,
    profit: 5472000,
    profitMargin: 63.2,
  },
  {
    productId: 7,
    name: "Trà Vải Hoa Nhài",
    category: "tra",
    unitsSold: 215,
    revenue: 8170000,
    costPrice: 13000,
    sellingPrice: 38000,
    profit: 5375000,
    profitMargin: 65.8,
  },
  {
    productId: 15,
    name: "Bánh Flan",
    category: "giai-khat",
    unitsSold: 198,
    revenue: 4950000,
    costPrice: 8000,
    sellingPrice: 25000,
    profit: 3366000,
    profitMargin: 68.0,
  },
  {
    productId: 11,
    name: "Nước Ép Dưa Hấu",
    category: "nuoc-ep",
    unitsSold: 182,
    revenue: 5460000,
    costPrice: 10000,
    sellingPrice: 30000,
    profit: 3640000,
    profitMargin: 66.7,
  },
  {
    productId: 14,
    name: "Bánh Mì Nướng Bơ",
    category: "giai-khat",
    unitsSold: 175,
    revenue: 3500000,
    costPrice: 6000,
    sellingPrice: 20000,
    profit: 2450000,
    profitMargin: 70.0,
  },
  {
    productId: 16,
    name: "Trân Châu Đen",
    category: "topping",
    unitsSold: 456,
    revenue: 4560000,
    costPrice: 2000,
    sellingPrice: 10000,
    profit: 3648000,
    profitMargin: 80.0,
  },
  {
    productId: 17,
    name: "Thạch Cà Phê",
    category: "topping",
    unitsSold: 389,
    revenue: 3890000,
    costPrice: 2000,
    sellingPrice: 10000,
    profit: 3112000,
    profitMargin: 80.0,
  },
  {
    productId: 18,
    name: "Trân Châu Trắng",
    category: "topping",
    unitsSold: 342,
    revenue: 3420000,
    costPrice: 2000,
    sellingPrice: 10000,
    profit: 2736000,
    profitMargin: 80.0,
  },
];

// ===== MOCK USERS (for UI demo – replace with real auth) =====
export const MOCK_USERS: Record<string, User> = {
  manager: {
    id: 1,
    name: "Nguyễn Văn An",
    role: "manager",
    avatar: null,
  },
  staff: {
    id: 2,
    name: "Trần Thị Bình",
    role: "staff",
    avatar: null,
  },
};

// ===== SHIFT / SCHEDULE DATA =====

export const DEPARTMENTS: Department[] = [
  { id: "bar", name: "Bar Staff", icon: "fa-solid fa-martini-glass-citrus" },
  { id: "kitchen", name: "Kitchen", icon: "fa-solid fa-kitchen-set" },
  { id: "cashier", name: "Cashier", icon: "fa-solid fa-cash-register" },
  { id: "janitor", name: "Janitor", icon: "fa-solid fa-broom" },
];

/**
 * Generate mock shift slots for the weeks around today (April 2026).
 * Covers Mon 6 Apr – Sun 26 Apr 2026.
 */
function generateMockShifts(): ShiftSlot[] {
  const shifts: ShiftSlot[] = [];
  const departments = ["bar", "kitchen", "cashier", "janitor"];
  const timeSlots = [
    { start: "07:00", end: "11:00", hours: 4, wage: 120000 },
    { start: "11:00", end: "15:00", hours: 4, wage: 120000 },
    { start: "15:00", end: "19:00", hours: 4, wage: 120000 },
    { start: "19:00", end: "22:00", hours: 3, wage: 100000 },
  ];

  const staffPool = [
    { id: 2, name: "Nguyễn Văn An" },
    { id: 3, name: "Trần Thị Bình" },
    { id: 4, name: "Lê Văn Cường" },
  ];

  // Generate shifts from April 6 to April 26, 2026
  let shiftCounter = 0;
  for (let day = 6; day <= 26; day++) {
    const dateStr = `2026-04-${day.toString().padStart(2, "0")}`;

    for (const dept of departments) {
      // Not every department has shifts every day
      if (dept === "janitor" && day % 3 !== 0) continue;

      for (const slot of timeSlots) {
        // Skip some slots randomly for variety
        if (dept === "kitchen" && slot.start === "19:00") continue;
        if (dept === "cashier" && slot.start === "07:00" && day % 2 === 0)
          continue;

        shiftCounter++;
        const shiftId = `shift_${shiftCounter.toString().padStart(3, "0")}`;

        // Determine registration status
        const registered: { id: number; name: string }[] = [];
        let status: ShiftSlot["status"] = "available";

        // Past shifts (before April 10) are mostly registered
        if (day < 10) {
          const staffIdx = shiftCounter % staffPool.length;
          registered.push(staffPool[staffIdx]);
          if (shiftCounter % 7 === 0) {
            registered.push(staffPool[(staffIdx + 1) % staffPool.length]);
          }
          status = "registered";
          // Some past shifts have leave/absent
          if (shiftCounter % 11 === 0) status = "approved_leave";
          if (shiftCounter % 13 === 0) status = "absent";
        }
        // Current week (April 6-12): mix of registered and available
        else if (day >= 10 && day <= 12) {
          if (shiftCounter % 3 === 0) {
            registered.push(staffPool[shiftCounter % staffPool.length]);
            status = "registered";
          }
        }
        // Future shifts: mostly available, some registered
        else {
          if (shiftCounter % 5 === 0) {
            registered.push(staffPool[shiftCounter % staffPool.length]);
            status = "registered";
          }
        }

        shifts.push({
          id: shiftId,
          date: dateStr,
          startTime: slot.start,
          endTime: slot.end,
          durationHours: slot.hours,
          wage: slot.wage,
          department: dept,
          maxStaff: dept === "bar" ? 3 : 2,
          registeredStaff: registered,
          status,
        });
      }
    }
  }

  return shifts;
}

export const MOCK_SHIFT_SLOTS: ShiftSlot[] = generateMockShifts();
