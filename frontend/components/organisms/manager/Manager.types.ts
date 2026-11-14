import type { Combo, MenuCategory, Product } from "@/lib/types";

export interface ProductModalProps {
  product: Product | null; // null = add mode
  categories: MenuCategory[];
  onSave: (p: Omit<Product, "id"> | Product) => void;
  onClose: () => void;
}

export interface CategoryModalProps {
  category: MenuCategory | null;
  onSave: (c: Omit<MenuCategory, "id"> | MenuCategory) => void;
  onClose: () => void;
}

export interface ComboModalProps {
  combo: Combo | null;
  products: Product[];
  onSave: (c: Omit<Combo, "id"> | Combo) => void;
  onClose: () => void;
}

export interface DeleteConfirmProps {
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}

export interface StatusBadgeProps {
  available: boolean;
}
