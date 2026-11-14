"use client";

import { useCatalog } from "@/lib/contexts/catalog-context";
import { useMenu } from "@/lib/contexts/menu-context";

import { categoryButtonClass, categoryIconClass } from "./categoryStyles";

/**
 * Horizontal, scrollable category tabs — mobile only (< md).
 * On md+ the CategorySidebar is used instead; both read the same menu state.
 */
export default function MobileCategoryTabs() {
  const { menuCategories } = useCatalog();
  const { activeCategory, setActiveCategory } = useMenu();

  return (
    <div className="bg-background sticky top-18 z-50 -mx-4 mb-4 overflow-x-auto px-4 pt-2 md:hidden">
      <div className="flex items-center gap-1.5 pb-1">
        {menuCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border-none px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 ${categoryButtonClass(isActive)}`}
            >
              <i
                className={`${cat.icon} shrink-0 text-sm ${categoryIconClass(isActive)}`}
              ></i>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
