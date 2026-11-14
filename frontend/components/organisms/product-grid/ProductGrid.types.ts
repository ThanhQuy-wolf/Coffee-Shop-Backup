import type { Combo, OrderItemType, Product } from "@/lib/types";

export interface ProductGridProps {
  products: Product[];
  combos: Combo[];
  searchQuery?: string;
  isSidebarOpen?: boolean;
  onAdd: (type: OrderItemType, item: Product | Combo) => void;
}
