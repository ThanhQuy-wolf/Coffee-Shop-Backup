// Mock data — replace with backend calls in lib/services when ready.
import type { Combo, MenuCategory, Product } from "../types";

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
