"use client";

import { Spinner } from "@/components/atoms";
import { SearchBar } from "@/components/molecules/search-bar";
import { CategorySidebar } from "@/components/organisms/navigation";
import { ProductGrid } from "@/components/organisms/product-grid";
import {
  ProductOptionsModal,
  type ProductOptionsModalProps,
} from "@/components/organisms/product-options";
import { type NewCartLine, useCart } from "@/lib/contexts/cart-context";
import { MenuProvider, useMenu } from "@/lib/contexts/menu-context";
import { shopService } from "@/lib/services";
import { ALL_CATEGORY_ID, catalogService } from "@/lib/services/catalog";
import type {
  Combo,
  Menu,
  OrderItemType,
  Product,
  ShopInfo,
} from "@/lib/types";
import { errorMessage } from "@/lib/utils/errors";
import { comboUnits, groupsOf } from "@/lib/utils/options";
import { useEffect, useState } from "react";

/** Home page: shop info and menu (UC-04, UC-05, UC-06). Loads both once. */
export default function HomePage() {
  const [data, setData] = useState<{ shop: ShopInfo; menu: Menu } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([shopService.get(), catalogService.getMenu()])
      .then(([shop, menu]) => !cancelled && setData({ shop, menu }))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <i className="fa-solid fa-store-slash mb-4 text-5xl text-(--color-border)"></i>
        <p className="text-foreground font-semibold">{error}</p>
      </div>
    );
  }
  if (!data) {
    return <Spinner label="Đang tải menu..." size="sm" className="py-24" />;
  }

  return (
    <MenuProvider categories={data.menu.categories}>
      <ShopMenu shop={data.shop} menu={data.menu} />
    </MenuProvider>
  );
}

/**
 * Shop banner, category navigation, search and product grid.
 * @param props.shop Shop info for the banner and opening hours.
 * @param props.menu Categories, products and combos on sale.
 */
function ShopMenu({ shop, menu }: { shop: ShopInfo; menu: Menu }) {
  const { activeCategory, setActiveCategory, menuCategories } = useMenu();
  const { addToCart } = useCart();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [picking, setPicking] = useState<Pick<
    ProductOptionsModalProps,
    "item" | "units"
  > | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsSidebarOpen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1500);
    return () => clearTimeout(t);
  }, [toast]);

  const add = (line: NewCartLine, quantity = 1) => {
    addToCart(line, quantity);
    setToast(`Đã thêm ${quantity > 1 ? `${quantity} × ` : ""}${line.name}`);
  };

  // FR-35, FR-37: a product with option groups, or a combo with such a
  // product inside, opens the picker first
  const handleAdd = (type: OrderItemType, item: Product | Combo) => {
    const units =
      type === "PRODUCT"
        ? [{ groups: groupsOf(item as Product, menu.optionGroups) }].filter(
            (u) => u.groups.length,
          )
        : comboUnits(item as Combo, menu.products, menu.optionGroups);
    if (units.length) {
      setPicking({
        item: { type, id: item.id, name: item.name, price: item.price },
        units,
      });
      return;
    }
    add({
      type,
      id: item.id,
      name: item.name,
      unitPrice: item.price,
      options: [],
    });
  };

  const activeLabel =
    menuCategories.find((c) => c.id === activeCategory)?.name ?? "Tất cả";

  return (
    <div className="bg-background flex min-h-[calc(100vh-var(--spacing-header-height))] items-start">
      <CategorySidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        openHours={shop.openHours}
      />

      <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8">
        <section className="mb-5 rounded-2xl border border-(--color-border-light) bg-(--color-bg-card) p-4">
          <h1 className="text-foreground text-xl font-bold">{shop.name}</h1>
          <p className="text-sm text-(--color-text-muted)">{shop.tagline}</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-(--color-text-secondary)">
            <li>
              <i className="fa-solid fa-location-dot mr-1.5 text-(--color-accent)"></i>
              {shop.address}
            </li>
            <li>
              <i className="fa-solid fa-clock mr-1.5 text-(--color-accent)"></i>
              {shop.openHours}
            </li>
            {shop.wifiName && (
              <li>
                <i className="fa-solid fa-wifi mr-1.5 text-(--color-accent)"></i>
                {shop.wifiName} /{" "}
                <span className="font-mono">{shop.wifiPassword}</span>
              </li>
            )}
          </ul>
        </section>

        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-foreground shrink-0 text-lg font-bold">
            {activeLabel}
          </h2>
          <SearchBar
            value={searchQuery}
            onChange={(q) => {
              if (q && activeCategory !== ALL_CATEGORY_ID)
                setActiveCategory(ALL_CATEGORY_ID);
              setSearchQuery(q);
            }}
            onClear={() => setSearchQuery("")}
            placeholder="Tìm kiếm món..."
            className="sm:max-w-xs"
          />
        </div>

        <ProductGrid
          products={menu.products}
          combos={menu.combos}
          searchQuery={searchQuery}
          isSidebarOpen={isSidebarOpen}
          onAdd={handleAdd}
        />
      </main>

      {picking && (
        <ProductOptionsModal
          item={picking.item}
          units={picking.units}
          onAdd={(line, quantity) => {
            add(line, quantity);
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-70 -translate-x-1/2 rounded-xl bg-(--color-primary-dark) px-4 py-2 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
