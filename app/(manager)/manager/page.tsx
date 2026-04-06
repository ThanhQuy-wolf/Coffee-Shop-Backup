"use client";

import {
  CategoriesTab,
  CombosTab,
  ProductsTab,
} from "@/components/organisms/manager";
import { useAuth } from "@/lib/auth-context";
import { useManager } from "@/lib/manager-context";
import Link from "next/link";

export default function ManagerPage() {
  const { user, logout } = useAuth();
  const { activeTab, setActiveTab, products, combos, categories } =
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
            <p className="text-foreground text-sm font-bold">Manager</p>
            <p className="text-xs text-(--color-text-muted)">Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
            Quản lý thực đơn
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
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-(--color-border-light) text-(--color-text-muted)"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
          <div className="mt-3 border-t border-(--color-border-light) pt-3">
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
              Phân tích
            </p>
            <Link
              href="/manager/analytics"
              className="hover:bg-background flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-(--color-text-secondary) no-underline transition-all hover:text-(--color-primary-dark)"
            >
              <i className="fa-solid fa-chart-line w-4 text-center"></i>
              <span className="flex-1 text-left">Tài chính</span>
              <span className="rounded-full bg-(--color-accent-light) px-2 py-0.5 text-xs font-semibold text-(--color-primary)">
                Mới
              </span>
            </Link>
          </div>
        </nav>

        <div className="border-t border-(--color-border-light) p-3">
          <div className="flex items-center gap-3 rounded-xl p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-accent-light)">
              <i className="fa-solid fa-user-tie text-sm text-(--color-primary)"></i>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-semibold">
                {user?.name ?? "Quản lý"}
              </p>
              <p className="text-xs text-(--color-text-muted)">Quản lý quán</p>
            </div>
          </div>
          <div className="mt-1 flex gap-2 px-1">
            <Link
              href="/"
              className="hover:bg-background flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-(--color-border-light) bg-transparent py-2 text-xs font-medium text-(--color-text-secondary) no-underline transition"
            >
              <i className="fa-solid fa-house"></i>
              Trang chủ
            </Link>
            <button
              onClick={logout}
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
              Quản lý{" "}
              {activeTab === "products"
                ? "thực đơn"
                : activeTab === "combos"
                  ? "combo"
                  : "danh mục"}{" "}
              của quán
            </p>
          </div>

          {/* Mobile tabs */}
          <div className="flex items-center gap-1 lg:hidden">
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
            <Link
              href="/manager/analytics"
              className="flex items-center gap-1.5 rounded-xl border-none bg-(--color-accent-light) px-3 py-2 text-xs font-medium text-(--color-primary) no-underline transition hover:bg-(--color-accent-light)/70"
            >
              <i className="fa-solid fa-chart-line"></i>
              <span className="hidden sm:inline">Tài chính</span>
            </Link>
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
              href="/"
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
          {activeTab === "categories" && <CategoriesTab />}
        </main>
      </div>
    </div>
  );
}
