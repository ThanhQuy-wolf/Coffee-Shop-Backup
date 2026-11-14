"use client";

import {
  CategoriesTab,
  CombosTab,
  ProductsTab,
  ReviewsTab,
  ShopInfoTab,
} from "@/components/organisms/manager";
import { useAuth } from "@/lib/contexts/auth-context";
import { type ManagerTab, useManager } from "@/lib/contexts/manager-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SUBTITLE: Record<ManagerTab, string> = {
  products: "Món, giá bán, giá vốn và tình trạng bán",
  combos: "Combo và các món thành phần",
  categories: "Nhóm món hiển thị trên menu",
  shop: "Thông tin quán và tham số vận hành",
  reviews: "Đánh giá của khách về quán",
};

const LINKS = [
  { href: "/staff/orders", label: "Đơn hàng", icon: "fa-solid fa-receipt" },
  {
    href: "/staff/schedule",
    label: "Ca làm",
    icon: "fa-solid fa-calendar-days",
  },
  {
    href: "/manager/analytics",
    label: "Thống kê",
    icon: "fa-solid fa-chart-line",
  },
];

/** UC-12 → UC-14 thực đơn, UC-15 thông tin quán, UC-17 xem đánh giá */
export default function ManagerPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeTab, setActiveTab, products, combos, categories, loadError } =
    useManager();

  const tabs = [
    {
      id: "products" as const,
      label: "Thực đơn",
      icon: "fa-solid fa-utensils",
      count: products.length,
    },
    {
      id: "combos" as const,
      label: "Combo",
      icon: "fa-solid fa-layer-group",
      count: combos.length,
    },
    {
      id: "categories" as const,
      label: "Danh mục",
      icon: "fa-solid fa-tags",
      count: categories.length,
    },
    {
      id: "shop" as const,
      label: "Thông tin quán",
      icon: "fa-solid fa-store",
      count: null,
    },
    {
      id: "reviews" as const,
      label: "Đánh giá",
      icon: "fa-solid fa-star",
      count: null,
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-(--color-border-light) bg-white shadow-sm lg:flex">
        <div className="flex items-center gap-3 border-b border-(--color-border-light) px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-primary)">
            <i className="fa-solid fa-store text-sm text-white"></i>
          </div>
          <div>
            <p className="text-foreground text-sm font-bold">Quản lý quán</p>
            <p className="text-xs text-(--color-text-muted)">Drinkool</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
            Quản lý quán
          </p>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-(--color-primary) text-white shadow-sm"
                  : "hover:bg-background bg-transparent text-(--color-text-secondary) hover:text-(--color-primary-dark)"
              }`}
            >
              <i className={`${tab.icon} w-4 text-center`}></i>
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-(--color-border-light) text-(--color-text-muted)"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          <div className="mt-3 border-t border-(--color-border-light) pt-3">
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
              Vận hành
            </p>
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:bg-background flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-(--color-text-secondary) no-underline transition-all hover:text-(--color-primary-dark)"
              >
                <i className={`${link.icon} w-4 text-center`}></i>
                <span className="flex-1 text-left">{link.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="border-t border-(--color-border-light) p-3">
          <div className="flex items-center gap-3 rounded-xl p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-accent-light)">
              <i className="fa-solid fa-user-tie text-sm text-(--color-primary)"></i>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-semibold">
                {user?.fullName ?? "Quản lý"}
              </p>
              <p className="text-xs text-(--color-text-muted)">Quản lý quán</p>
            </div>
          </div>
          <div className="mt-1 flex gap-2 px-1">
            <Link
              href="/feed"
              className="hover:bg-background flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-(--color-border-light) bg-transparent py-2 text-xs font-medium text-(--color-text-secondary) no-underline transition"
            >
              <i className="fa-solid fa-house"></i>
              Trang chủ
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/feed");
              }}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-transparent py-2 text-xs font-medium text-red-500 transition hover:bg-red-50"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-(--color-border-light) bg-white px-5 py-4 shadow-sm">
          <div>
            <h1 className="text-foreground text-lg font-bold">
              {tabs.find((t) => t.id === activeTab)?.label ?? "Quản lý"}
            </h1>
            <p className="text-xs text-(--color-text-muted)">
              {SUBTITLE[activeTab]}
            </p>
          </div>

          {/* Mobile tabs */}
          <div className="flex flex-wrap items-center justify-end gap-1 lg:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl border-none px-3 py-2 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? "bg-(--color-primary) text-white"
                    : "bg-background text-(--color-text-secondary) hover:text-(--color-primary)"
                }`}
              >
                <i className={tab.icon}></i>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className="flex items-center gap-1.5 rounded-xl border-none bg-(--color-accent-light) px-3 py-2 text-xs font-medium text-(--color-primary) no-underline transition hover:bg-(--color-accent-light)/70"
              >
                <i className={link.icon}></i>
                <span className="sr-only">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/manager/analytics"
              className="flex items-center gap-1.5 rounded-xl bg-(--color-accent-light) px-3 py-2 text-xs font-medium text-(--color-primary) no-underline transition hover:opacity-80"
            >
              <i className="fa-solid fa-chart-line"></i>
              Thống kê tài chính
            </Link>
            <Link
              href="/feed"
              className="hover:bg-background flex items-center gap-1.5 rounded-xl border border-(--color-border-light) bg-transparent px-3 py-2 text-xs font-medium text-(--color-text-secondary) no-underline transition"
            >
              <i className="fa-solid fa-house"></i>
              Trang chủ
            </Link>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "combos" && <CombosTab />}
          {loadError && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {loadError}
            </p>
          )}
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "shop" && <ShopInfoTab />}
          {activeTab === "reviews" && <ReviewsTab />}
        </main>
      </div>
    </div>
  );
}
