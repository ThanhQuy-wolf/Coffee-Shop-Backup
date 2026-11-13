"use client";

import { ProductCard } from "@/components/molecules/cards";
import { MobileCategoryTabs } from "@/components/organisms/navigation";
import { useCart } from "@/lib/contexts/cart-context";
import { useCatalog } from "@/lib/contexts/catalog-context";
import { useMenu } from "@/lib/contexts/menu-context";

import type { ProductGridProps } from "./ProductGrid.types";

export default function ProductGrid({
  searchQuery = "",
  isSidebarOpen = false,
}: ProductGridProps) {
  const { activeCategory } = useMenu();
  const { products } = useCatalog();
  const { addToCart } = useCart();

  const query = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((p) => {
    const isAvailable = p.available !== false;
    const matchesCategory =
      activeCategory === "all" || p.category === activeCategory;
    const matchesSearch =
      query === "" ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);
    return isAvailable && matchesCategory && matchesSearch;
  });

  const gridCols = isSidebarOpen
    ? "grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    : "grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

  return (
    <>
      <MobileCategoryTabs />

      {/* ── Product grid ── */}
      {filteredProducts.length > 0 ? (
        <div className={`grid gap-4 ${gridCols}`}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              image={product.image}
              imageAlt={product.name}
              productName={product.name}
              price={product.price}
              description={product.description}
              onBuy={() => addToCart(product)}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-(--color-text-muted)">
          <i className="fa-solid fa-mug-hot text-5xl opacity-30"></i>
          <p className="text-base font-medium">
            {searchQuery
              ? `Không tìm thấy món nào cho "${searchQuery}"`
              : "Chưa có món trong danh mục này"}
          </p>
        </div>
      )}
    </>
  );
}
