// ===== USER TYPES =====
export type UserRole = "manager" | "staff" | "customer";

export interface User {
  id: number;
  name: string;
  role: UserRole;
  avatar: string | null;
  phone?: string;
}

// ===== MENU TYPES =====
export interface MenuCategory {
  id: string;
  name: string;
  icon: string; // FontAwesome class e.g. "fa-solid fa-mug-hot"
}

// ===== PRODUCT TYPES =====
export interface Product {
  id: number;
  name: string;
  category: string; // matches MenuCategory.id
  price: number;
  image: string;
  description: string;
  available?: boolean;
}

// ===== SHOP INFO TYPES =====
export interface WifiInfo {
  name: string;
  password: string;
}

export interface ShopInfo {
  name: string;
  tagline: string;
  logo: string;
  address: string;
  phone: string;
  managerPhone: string;
  email: string;
  wifi: WifiInfo;
  openHours: string;
}

// ===== SOCIAL LINKS TYPES =====
export interface SocialLinks {
  facebook: string;
  tiktok: string;
  website: string;
}

// ===== SHOP (QUÁN NƯỚC) TYPES =====
export interface Shop {
  id: number;
  name: string;
  address: string;
  image: string;
}

// ===== FINANCIAL ANALYTICS TYPES =====
export type AnalyticsPeriod = "day" | "week" | "month" | "year";

export interface RevenueDataPoint {
  label: string; // e.g. "01/04", "Tuần 1", "Tháng 1"
  revenue: number;
  orders: number;
}

export interface ProductSalesStats {
  productId: number;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  costPrice: number; // giá nhập
  sellingPrice: number; // giá bán
  profit: number;
  profitMargin: number; // %
}

export interface PeriodComparison {
  current: number;
  previous: number;
  change: number; // absolute
  changePercent: number; // %
  isPositive: boolean;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProfit: number;
  averageOrderValue: number;
  revenueComparison: PeriodComparison;
  ordersComparison: PeriodComparison;
  profitComparison: PeriodComparison;
}

// ===== COMBO TYPES =====
export interface ComboItem {
  productId: number;
  quantity: number;
}

export interface Combo {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  items: ComboItem[]; // list of products + quantities in this combo
  available: boolean;
}
