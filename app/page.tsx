"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CartProduct from "@/components/CartProduct";
import { MENU_CATEGORIES, MOCK_PRODUCTS } from "@/lib/constants";
import { useMenu } from "@/lib/menu-context";

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
  /* Shared category state comes from MenuContext so the header mobile menu
   * and this sidebar always reflect the same selection. */
  const { activeCategory, setActiveCategory } = useMenu();

  /* Start collapsed (false) so SSR and client initial render match.
   * useEffect sets the correct value after hydration completes. */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* After mount: sync sidebar with viewport width, then subscribe to changes.
   * The initial setIsSidebarOpen call is intentional (post-hydration only)
   * and does not cause cascading renders — suppress the lint rule here. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsSidebarOpen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Clear search whenever the active category changes (triggered from either
   * the sidebar on md+ or the header scrollable menu on < md).
   * setState-in-effect is intentional here — suppress the lint rule. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery("");
  }, [activeCategory]);

  /* Filter products by availability, active category, and search query.
   * p.available defaults to true when undefined (opt-in unavailability). */
  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const isAvailable = p.available !== false;
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return isAvailable && matchesCategory && matchesSearch;
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
      className="flex items-start bg-background min-h-[calc(100vh-var(--spacing-header-height))]"
    >
      {/* ── Sidebar ── */}
      <Navbar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 px-4 py-6 md:px-6 lg:px-8">

        {/* ── Section heading + search bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          {/* Title + count */}
          <div className="shrink-0">
            <h2 className="text-xl font-bold text-foreground">
              {activeCategoryLabel}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredProducts.length} món
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:max-w-xs">
            <i
              className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2
                         text-sm text-(--color-text-muted) pointer-events-none"
            ></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm món..."
              className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border outline-none
                         bg-card text-foreground
                         border-border placeholder:text-muted-foreground
                         focus:border-primary focus:ring-2
                         focus:ring-primary focus:ring-opacity-20
                         transition-all duration-150"
            />
            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                title="Xóa tìm kiếm"
                aria-label="Xóa tìm kiếm"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)
                           hover:text-(--color-primary) transition-colors duration-150
                           cursor-pointer border-none bg-transparent p-0"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile category menu — visible only on < md, below search, above products ── */}
        <div className="md:hidden sticky top-18 pt-2 bg-background z-50 -mx-4 px-4 overflow-x-auto mb-4">
          <div className="flex items-center gap-1.5 pb-1">
            {MENU_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-xl
                    text-sm font-medium whitespace-nowrap shrink-0
                    cursor-pointer border-none transition-all duration-150
                    ${
                      isActive
                        ? "bg-(--color-primary) text-white shadow-sm"
                        : "bg-transparent text-(--color-text-secondary) hover:bg-(--color-border-light) hover:text-(--color-primary-dark)"
                    }
                  `}
                >
                  <i
                    className={`
                      ${cat.icon} text-sm shrink-0
                      ${isActive ? "text-white" : "text-(--color-primary)"}
                    `}
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
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-(--color-text-muted)">
            <i className="fa-solid fa-mug-hot text-5xl opacity-30"></i>
            <p className="text-base font-medium">
              {searchQuery
                ? `Không tìm thấy món nào cho "${searchQuery}"`
                : "Chưa có món trong danh mục này"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-(--color-primary) hover:underline cursor-pointer
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
