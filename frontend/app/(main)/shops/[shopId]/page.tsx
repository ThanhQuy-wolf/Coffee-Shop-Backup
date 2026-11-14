"use client";

import { Modal, ModalHeader } from "@/components/molecules/modal";
import { SearchBar } from "@/components/molecules/search-bar";
import { CategorySidebar } from "@/components/organisms/navigation";
import { ProductGrid } from "@/components/organisms/product-grid";
import { type CartAddInput, useCart } from "@/lib/contexts/cart-context";
import { MenuProvider, useMenu } from "@/lib/contexts/menu-context";
import { ALL_CATEGORY_ID, catalogService } from "@/lib/services/catalog";
import type { Combo, Menu, OrderItemType, Product } from "@/lib/types";
import { errorMessage } from "@/lib/utils/errors";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

/** UC-04, UC-05, UC-06 */
export default function ShopMenuPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    catalogService
      .getMenu(Number(shopId))
      .then((m) => !cancelled && setMenu(m))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <i className="fa-solid fa-store-slash mb-4 text-5xl text-(--color-border)"></i>
        <p className="text-foreground font-semibold">{error}</p>
      </div>
    );
  }
  if (!menu) {
    return (
      <p className="py-24 text-center text-sm text-(--color-text-muted)">
        <i className="fa-solid fa-spinner fa-spin mr-2"></i>Đang tải menu...
      </p>
    );
  }

  return (
    <MenuProvider categories={menu.categories}>
      <ShopMenu menu={menu} />
    </MenuProvider>
  );
}

function ShopMenu({ menu }: { menu: Menu }) {
  const { shop } = menu;
  const { activeCategory, setActiveCategory, menuCategories } = useMenu();
  const { addToCart, replaceCart, cart } = useCart();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pending, setPending] = useState<CartAddInput | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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

  const handleAdd = (type: OrderItemType, item: Product | Combo) => {
    const input: CartAddInput = {
      shopId: shop.id,
      shopName: shop.name,
      line: { type, id: item.id, name: item.name, unitPrice: item.price },
    };
    // BR-20: one shop per cart, ask before throwing the old cart away
    if (addToCart(input)) setToast(`Đã thêm ${item.name}`);
    else setPending(input);
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

      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-70 -translate-x-1/2 rounded-xl bg-(--color-primary-dark) px-4 py-2 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      {pending && (
        <Modal onClose={() => setPending(null)}>
          <ModalHeader title="Đổi quán?" onClose={() => setPending(null)} />
          <div className="space-y-4 px-5 py-4 text-sm">
            <p>
              Giỏ hàng đang có món của <strong>{cart?.shopName}</strong>. Mỗi
              đơn chỉ đặt được ở một quán. Xoá giỏ cũ để thêm món của{" "}
              {shop.name}?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  replaceCart(pending);
                  setToast(`Đã thêm ${pending.line.name}`);
                  setPending(null);
                }}
                className="flex-1 cursor-pointer rounded-xl border-none bg-(--color-primary) px-4 py-2.5 font-semibold text-white"
              >
                Xoá giỏ cũ và thêm
              </button>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="cursor-pointer rounded-xl border border-(--color-border-light) bg-transparent px-4 py-2.5"
              >
                Giữ giỏ cũ
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
