"use client";

import CartProduct from "@/components/CartProduct";
import Navbar from "@/components/Navbar";
import { useCart } from "@/lib/cart-context";
import { MENU_CATEGORIES, MOCK_PRODUCTS } from "@/lib/constants";
import { useMenu } from "@/lib/menu-context";
import { useEffect, useState } from "react";

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
  const { addToCart } = useCart();

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
    const matchesCategory =
      activeCategory === "all" || p.category === activeCategory;
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
    <div className="bg-background flex min-h-[calc(100vh-var(--spacing-header-height))] items-start">
      {/* ── Sidebar ── */}
      <Navbar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* ── Main content ── */}
      <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8">
        {/* ── Section heading + search bar ── */}
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          {/* Title + count */}
          <div className="shrink-0">
            <h2 className="text-foreground text-xl font-bold">
              {activeCategoryLabel}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {filteredProducts.length} món
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:max-w-xs">
            <i className="fa-solid fa-magnifying-glass pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-(--color-text-muted)"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm món..."
              className="bg-card text-foreground border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary focus:ring-opacity-20 w-full rounded-xl border py-2 pr-9 pl-9 text-sm transition-all duration-150 outline-none focus:ring-2"
            />
            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                title="Xóa tìm kiếm"
                aria-label="Xóa tìm kiếm"
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 text-(--color-text-muted) transition-colors duration-150 hover:text-(--color-primary)"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile category menu — visible only on < md, below search, above products ── */}
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
              <CartProduct
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
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="cursor-pointer border-none bg-transparent text-sm text-(--color-primary) hover:underline"
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
