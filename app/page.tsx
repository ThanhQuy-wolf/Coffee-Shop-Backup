"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CartProduct from "@/components/CartProduct";
import { MENU_CATEGORIES, MOCK_PRODUCTS } from "@/lib/constants";

/**
 * Main page — sidebar + product grid layout.
 *
 * Layout:
 *   [Sidebar (sticky, collapsible)] | [Main content (scrollable)]
 *
 * Sidebar state:
 *   - Desktop (≥ 1024px): expanded by default
 *   - Mobile  (< 1024px): collapsed by default
 *
 * Product grid columns (responsive, depends on sidebar state):
 *   Collapsed sidebar:  2 → sm:2 → lg:3 → xl:4 → 2xl:5
 *   Expanded  sidebar:  1 → sm:2 → lg:2 → xl:3 → 2xl:4
 */
export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  /* Default: expanded on desktop, collapsed on mobile */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsSidebarOpen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsSidebarOpen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Filter products by active category + search query */
  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  /* Active category label */
  const activeCategoryLabel =
    MENU_CATEGORIES.find((c) => c.id === activeCategory)?.name ?? "Tất cả";

  /* Responsive grid class based on sidebar state
   * Base (< 480px) : 1 col  — very small phones
   * min-[480px]    : 2 cols — larger phones
   * lg+            : 2/3 cols depending on sidebar
   */
  const gridCols = isSidebarOpen
    ? "grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    : "grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

  return (
    /* Outer wrapper: flex row, align-items: flex-start so sidebar sticks */
    <div
      className="flex items-start bg-[var(--color-bg-main)]"
      style={{ minHeight: "calc(100vh - var(--spacing-header-height))" }}
    >
      {/* ── Sidebar ── */}
      <Navbar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        activeCategory={activeCategory}
        onCategoryChange={(id) => {
          setActiveCategory(id);
          setSearchQuery(""); // clear search when switching category
        }}
      />

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 px-4 py-6 md:px-6 lg:px-8">

        {/* ── Section heading + search bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          {/* Title + count */}
          <div className="shrink-0">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              {activeCategoryLabel}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              {filteredProducts.length} món
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:max-w-xs">
            <i
              className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2
                         text-sm text-[var(--color-text-muted)] pointer-events-none"
            ></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm món..."
              className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border outline-none
                         bg-[var(--color-bg-card)] text-[var(--color-text-primary)]
                         border-[var(--color-border)] placeholder:text-[var(--color-text-muted)]
                         focus:border-[var(--color-primary)] focus:ring-2
                         focus:ring-[var(--color-primary)] focus:ring-opacity-20
                         transition-all duration-150"
            />
            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                title="Xóa tìm kiếm"
                aria-label="Xóa tìm kiếm"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]
                           hover:text-[var(--color-primary)] transition-colors duration-150
                           cursor-pointer border-none bg-transparent p-0"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            )}
          </div>
        </div>

        {/* ── Product grid ── */}
        {filteredProducts.length > 0 ? (
          <div className={`grid gap-4 ${gridCols}`}>
            {filteredProducts.map((product) => (
              <CartProduct
                key={product.id}
                image={product.image}
                imageAlt={product.name}
                productName={product.name}
                price={product.price}
                description={product.description}
                onBuy={() => {
                  /* TODO: add to cart logic */
                  console.log("Thêm vào giỏ:", product.name);
                }}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-[var(--color-text-muted)]">
            <i className="fa-solid fa-mug-hot text-5xl opacity-30"></i>
            <p className="text-base font-medium">
              {searchQuery
                ? `Không tìm thấy món nào cho "${searchQuery}"`
                : "Chưa có món trong danh mục này"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-[var(--color-primary)] hover:underline cursor-pointer
                           border-none bg-transparent"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
