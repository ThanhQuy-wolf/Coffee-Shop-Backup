"use client";

import { SearchBar } from "@/components/molecules/search-bar";
import { ShopGrid } from "@/components/organisms/shop-grid";
import { useState } from "react";

export default function FeedPage() {
  const [searchName, setSearchName] = useState("");
  const [searchAddress, setSearchAddress] = useState("");

  const hasFilters = searchName || searchAddress;

  return (
    <main className="bg-background min-h-[calc(100vh-var(--spacing-header-height))]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-foreground text-2xl font-bold md:text-3xl">
            Khám phá quán nước
          </h1>
          <p className="mt-1 text-sm text-(--color-text-muted)">
            Tìm và chọn quán yêu thích của bạn
          </p>
        </div>

        {/* Shop grid */}
        <div className="mb-10">
          <ShopGrid searchName={searchName} searchAddress={searchAddress} />
          {hasFilters && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  setSearchName("");
                  setSearchAddress("");
                }}
                className="cursor-pointer border-none bg-transparent text-sm text-(--color-primary) hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Filter / Search bar — sticky bottom */}
        <div className="sticky bottom-0 rounded-2xl border border-(--color-border) bg-(--color-bg-card) p-4 shadow-[0_-2px_16px_var(--color-shadow-sm)] md:p-5">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-(--color-text-secondary)">
              <i className="fa-solid fa-filter text-(--color-primary)"></i>
              <span>Lọc quán</span>
            </div>

            {/* Name search */}
            <SearchBar
              value={searchName}
              onChange={setSearchName}
              onClear={() => setSearchName("")}
              placeholder="Tìm theo tên quán..."
              className="min-w-0 flex-1"
            />

            {/* Address search — different icon so not using SearchBar atom */}
            <div className="relative min-w-0 flex-1">
              <i className="fa-solid fa-location-dot pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-(--color-text-muted)"></i>
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Tìm theo địa chỉ..."
                className="bg-background text-foreground focus:ring-opacity-20 w-full rounded-xl border border-(--color-border) py-2.5 pr-9 pl-9 text-sm transition-all duration-150 outline-none placeholder:text-(--color-text-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)"
              />
              {searchAddress && (
                <button
                  onClick={() => setSearchAddress("")}
                  aria-label="Xóa tìm kiếm địa chỉ"
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 text-(--color-text-muted) transition-colors duration-150 hover:text-(--color-primary)"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
