"use client";

import { SearchBar } from "@/components/molecules/search-bar";
import { CategorySidebar } from "@/components/organisms/navigation";
import { ProductGrid } from "@/components/organisms/product-grid";
import { MENU_CATEGORIES } from "@/lib/constants";
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
 */
export default function Home() {
  const { activeCategory, setActiveCategory } = useMenu();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsSidebarOpen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery("");
  }, [activeCategory]);

  const activeCategoryLabel =
    MENU_CATEGORIES.find((c) => c.id === activeCategory)?.name ?? "Tất cả";

  return (
    <div className="bg-background flex min-h-[calc(100vh-var(--spacing-header-height))] items-start">
      {/* ── Sidebar ── */}
      <CategorySidebar
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
          </div>

          {/* Search bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Tìm kiếm món..."
            className="sm:max-w-xs"
          />
        </div>

        {/* ── Product grid (organism handles mobile category menu + grid) ── */}
        <ProductGrid searchQuery={searchQuery} isSidebarOpen={isSidebarOpen} />
      </main>
    </div>
  );
}
