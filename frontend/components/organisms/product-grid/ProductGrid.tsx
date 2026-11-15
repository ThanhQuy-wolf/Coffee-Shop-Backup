"use client";

import { ProductCard } from "@/components/molecules/cards";
import { EmptyState } from "@/components/molecules/empty-state";
import { MobileCategoryTabs } from "@/components/organisms/navigation";
import { useMenu } from "@/lib/contexts/menu-context";
import { ALL_CATEGORY_ID } from "@/lib/services/catalog";

import type { ProductGridProps } from "./ProductGrid.types";

/**
 * Menu grid of the selected category, filtered by the search text. Combos
 * show only under "Tất cả" because they have no category. The number of
 * columns shrinks while the sidebar is expanded.
 * @param props.products Products on sale (S-6 already filters them).
 * @param props.combos Combos on sale.
 * @param props.searchQuery Text to match against names and descriptions.
 * @param props.isSidebarOpen Whether the category sidebar is expanded.
 * @param props.onAdd Called when "Mua" is pressed on a card.
 */
export default function ProductGrid({
  products,
  combos,
  searchQuery = "",
  isSidebarOpen = false,
  onAdd,
}: ProductGridProps) {
  const { activeCategory } = useMenu();

  const query = searchQuery.trim().toLowerCase();
  const matches = (x: { name: string; description: string }) =>
    query === "" ||
    x.name.toLowerCase().includes(query) ||
    x.description.toLowerCase().includes(query);

  const showAll = activeCategory === ALL_CATEGORY_ID;
  const visibleProducts = products.filter(
    (p) => (showAll || p.categoryId === activeCategory) && matches(p),
  );
  // Combos have no category, so they appear under "Tất cả" only
  const visibleCombos = showAll ? combos.filter(matches) : [];

  const gridCols = isSidebarOpen
    ? "grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    : "grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

  const isEmpty = visibleProducts.length === 0 && visibleCombos.length === 0;

  return (
    <>
      <MobileCategoryTabs />

      {isEmpty ? (
        <EmptyState
          icon={searchQuery ? "magnifying-glass" : "mug-hot"}
          title={
            searchQuery
              ? `Không tìm thấy món nào cho "${searchQuery}"`
              : "Chưa có món trong danh mục này"
          }
          description={
            searchQuery ? "Thử gõ ít chữ hơn hoặc tên khác." : undefined
          }
        />
      ) : (
        <div className={`grid gap-4 ${gridCols}`}>
          {visibleCombos.map((combo) => (
            <ProductCard
              key={`combo-${combo.id}`}
              image={combo.imageUrl}
              imageAlt={combo.name}
              productName={combo.name}
              price={combo.price}
              description={combo.description}
              badge="Combo"
              onBuy={() => onAdd("COMBO", combo)}
            />
          ))}
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              image={product.imageUrl}
              imageAlt={product.name}
              productName={product.name}
              price={product.price}
              description={product.description}
              onBuy={() => onAdd("PRODUCT", product)}
            />
          ))}
        </div>
      )}
    </>
  );
}
