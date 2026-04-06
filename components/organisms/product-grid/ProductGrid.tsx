"use client";

import { ProductCard } from "@/components/molecules/cards";
import { useCart } from "@/lib/cart-context";
import { MENU_CATEGORIES, MOCK_PRODUCTS } from "@/lib/constants";
import { useMenu } from "@/lib/menu-context";

import type { ProductGridProps } from "./ProductGrid.types";

export default function ProductGrid({
  searchQuery = "",
  isSidebarOpen = false,
}: ProductGridProps) {
  const { activeCategory, setActiveCategory } = useMenu();
  const { addToCart } = useCart();

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const isAvailable = p.available !== false;
    const matchesCategory =
      activeCategory === "all" || p.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return isAvailable && matchesCategory && matchesSearch;
  });

  const activeCategoryLabel =
    MENU_CATEGORIES.find((c) => c.id === activeCategory)?.name ?? "Tất cả";

  const gridCols = isSidebarOpen
    ? "grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    : "grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

  return (
    <>
      {/* ── Mobile category menu — visible only on < md ── */}
      <div className="bg-background sticky top-18 z-50 -mx-4 mb-4 overflow-x-auto px-4 pt-2 md:hidden">
        <div className="flex items-center gap-1.5 pb-1">
          {MENU_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border-none px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? "bg-(--color-primary) text-white shadow-sm"
                    : "bg-transparent text-(--color-text-secondary) hover:bg-(--color-border-light) hover:text-(--color-primary-dark)"
                } `}
              >
                <i
                  className={` ${cat.icon} shrink-0 text-sm ${isActive ? "text-white" : "text-(--color-primary)"} `}
                ></i>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

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
