// Seed menu of shop 1. lib/mock-data/db.ts copies it for the other shops.
import type { Combo, MenuCategory, Product } from "../types";

// ===== MENU CATEGORIES =====
export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 1,
    shopId: 1,
    name: "Cà Phê",
    icon: "fa-solid fa-mug-hot",
    sortOrder: 1,
  },
  { id: 2, shopId: 1, name: "Trà", icon: "fa-solid fa-leaf", sortOrder: 2 },
  { id: 3, shopId: 1, name: "Sữa Chua", icon: "fa-solid fa-jar", sortOrder: 3 },
  {
    id: 4,
    shopId: 1,
    name: "Nước Ép",
    icon: "fa-solid fa-blender",
    sortOrder: 4,
  },
  {
    id: 5,
    shopId: 1,
    name: "Latte",
    icon: "fa-solid fa-mug-saucer",
    sortOrder: 5,
  },
  {
    id: 6,
    shopId: 1,
    name: "Giải Khát / Ăn Vặt",
    icon: "fa-solid fa-ice-cream",
    sortOrder: 6,
  },
  {
    id: 7,
    shopId: 1,
    name: "Topping",
    icon: "fa-solid fa-layer-group",
    sortOrder: 7,
  },
];

// ===== MOCK PRODUCTS =====
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    shopId: 1,
    name: "Cà Phê Đen",
    categoryId: 1,
    price: 25000,
    costPrice: 10000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Cà phê đen truyền thống, đậm đà hương vị Việt Nam, pha phin thủ công.",
    isAvailable: true,
  },
  {
    id: 2,
    shopId: 1,
    name: "Cà Phê Sữa",
    categoryId: 1,
    price: 30000,
    costPrice: 11000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Cà phê sữa đặc thơm ngon, béo ngậy, kết hợp hoàn hảo giữa cà phê và sữa đặc.",
    isAvailable: true,
  },
  {
    id: 3,
    shopId: 1,
    name: "Bạc Xỉu",
    categoryId: 1,
    price: 32000,
    costPrice: 12000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Bạc xỉu nhẹ nhàng, ít cà phê nhiều sữa, thích hợp cho người mới uống cà phê.",
    isAvailable: true,
  },
  {
    id: 4,
    shopId: 1,
    name: "Cà Phê Trứng",
    categoryId: 1,
    price: 45000,
    costPrice: 0,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Cà phê trứng đặc sản Hà Nội, lớp kem trứng mịn màng phủ trên nền cà phê đậm đà.",
    isAvailable: true,
  },
  {
    id: 5,
    shopId: 1,
    name: "Trà Đào Cam Sả",
    categoryId: 2,
    price: 35000,
    costPrice: 13000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Trà đào thơm mát kết hợp cam tươi và sả, thanh mát và giải nhiệt tuyệt vời.",
    isAvailable: true,
  },
  {
    id: 6,
    shopId: 1,
    name: "Trà Xanh Matcha",
    categoryId: 2,
    price: 40000,
    costPrice: 15000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Matcha Nhật Bản nguyên chất, vị đắng nhẹ đặc trưng, thơm mát và bổ dưỡng.",
    isAvailable: true,
  },
  {
    id: 7,
    shopId: 1,
    name: "Trà Vải Hoa Nhài",
    categoryId: 2,
    price: 38000,
    costPrice: 14000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Trà vải thanh ngọt kết hợp hương hoa nhài dịu dàng, thư giãn tâm hồn.",
    isAvailable: true,
  },
  {
    id: 8,
    shopId: 1,
    name: "Sữa Chua Trân Châu",
    categoryId: 3,
    price: 38000,
    costPrice: 14000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Sữa chua mịn màng kết hợp trân châu đen dẻo dai, chua ngọt hài hòa.",
    isAvailable: true,
  },
  {
    id: 9,
    shopId: 1,
    name: "Sữa Chua Dâu",
    categoryId: 3,
    price: 40000,
    costPrice: 15000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Sữa chua mát lạnh với dâu tươi ngọt chua, giàu vitamin và khoáng chất.",
    isAvailable: true,
  },
  {
    id: 10,
    shopId: 1,
    name: "Nước Ép Cam",
    categoryId: 4,
    price: 35000,
    costPrice: 13000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Nước ép cam tươi nguyên chất, giàu vitamin C, tốt cho sức khỏe.",
    isAvailable: true,
  },
  {
    id: 11,
    shopId: 1,
    name: "Nước Ép Dưa Hấu",
    categoryId: 4,
    price: 30000,
    costPrice: 11000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Nước ép dưa hấu mát lạnh, giải nhiệt tức thì trong những ngày hè oi bức.",
    isAvailable: true,
  },
  {
    id: 12,
    shopId: 1,
    name: "Latte Caramel",
    categoryId: 5,
    price: 45000,
    costPrice: 17000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Latte caramel ngọt ngào, thơm béo với lớp foam sữa mịn và sốt caramel.",
    isAvailable: true,
  },
  {
    id: 13,
    shopId: 1,
    name: "Latte Vanilla",
    categoryId: 5,
    price: 45000,
    costPrice: 17000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Latte vanilla nhẹ nhàng, hương thơm dịu dàng từ vanilla tự nhiên.",
    isAvailable: true,
  },
  {
    id: 14,
    shopId: 1,
    name: "Bánh Mì Nướng Bơ",
    categoryId: 6,
    price: 20000,
    costPrice: 8000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Bánh mì nướng giòn rụm, phết bơ thơm và mứt dâu, ăn kèm cà phê tuyệt vời.",
    isAvailable: true,
  },
  {
    id: 15,
    shopId: 1,
    name: "Bánh Flan",
    categoryId: 6,
    price: 25000,
    costPrice: 10000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Bánh flan mềm mịn, ngọt ngào với lớp caramel vàng óng, tan chảy trong miệng.",
    isAvailable: true,
  },
  {
    id: 16,
    shopId: 1,
    name: "Trân Châu Đen",
    categoryId: 7,
    price: 10000,
    costPrice: 4000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Trân châu đen dẻo dai, thêm vào bất kỳ đồ uống nào để tăng thêm hương vị.",
    isAvailable: true,
  },
  {
    id: 17,
    shopId: 1,
    name: "Thạch Cà Phê",
    categoryId: 7,
    price: 10000,
    costPrice: 4000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Thạch cà phê mát lạnh, thêm hương vị đặc biệt cho đồ uống của bạn.",
    isAvailable: true,
  },
  {
    id: 18,
    shopId: 1,
    name: "Trân Châu Trắng",
    categoryId: 7,
    price: 10000,
    costPrice: 4000,
    imageUrl: "/imgs/products/placeholder.jpg",
    description:
      "Trân châu trắng dẻo dai, thêm vào bất kỳ đồ uống nào để tăng thêm hương vị.",
    isAvailable: true,
  },
];

// ===== MOCK COMBOS =====
export const MOCK_COMBOS: Combo[] = [
  {
    id: 1,
    shopId: 1,
    name: "Combo Cà Phê Đôi",
    description: "2 ly cà phê đen + 2 bánh mì nướng bơ, tiết kiệm 15%.",
    price: 75000,
    imageUrl: "/imgs/products/placeholder.jpg",
    items: [
      { productId: 1, quantity: 2 },
      { productId: 14, quantity: 2 },
    ],
    isAvailable: true,
    sellable: true,
  },
  {
    id: 2,
    shopId: 1,
    name: "Combo Trà Sữa Nhóm",
    description: "2 trà đào cam sả + 2 trà xanh matcha, dành cho nhóm bạn.",
    price: 130000,
    imageUrl: "/imgs/products/placeholder.jpg",
    items: [
      { productId: 5, quantity: 2 },
      { productId: 6, quantity: 2 },
    ],
    isAvailable: true,
    sellable: true,
  },
  {
    id: 3,
    shopId: 1,
    name: "Combo Buổi Sáng",
    description: "1 cà phê sữa + 1 bánh flan, khởi đầu ngày mới ngọt ngào.",
    price: 48000,
    imageUrl: "/imgs/products/placeholder.jpg",
    items: [
      { productId: 2, quantity: 1 },
      { productId: 15, quantity: 1 },
    ],
    isAvailable: false,
    sellable: false,
  },
];
