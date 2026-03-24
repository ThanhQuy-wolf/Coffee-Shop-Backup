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
