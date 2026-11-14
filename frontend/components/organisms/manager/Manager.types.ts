import type {
  CategoryInput,
  Combo,
  ComboInput,
  MenuCategory,
  Product,
  ProductInput,
} from "@/lib/types";

// Each onSave resolves once the server accepted the change; the modal shows
// the error itself when it rejects, and stays open.

export interface ProductModalProps {
  product: Product | null; // null = add mode
  categories: MenuCategory[];
  onSave: (input: ProductInput) => Promise<void>;
  onClose: () => void;
}

export interface CategoryModalProps {
  category: MenuCategory | null;
  nextSortOrder: number;
  onSave: (input: CategoryInput) => Promise<void>;
  onClose: () => void;
}

export interface ComboModalProps {
  combo: Combo | null;
  products: Product[];
  onSave: (input: ComboInput) => Promise<void>;
  onClose: () => void;
}

export interface DeleteConfirmProps {
  name: string;
  /** What happens to the data, e.g. soft delete (BR-11, BR-14) */
  note?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export interface StatusBadgeProps {
  available: boolean;
  /** Combo: on but a component product is off (BR-13) */
  blocked?: boolean;
}
