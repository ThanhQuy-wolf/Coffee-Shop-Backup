"use client";

import { MOCK_SHOPS } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function FeedPage() {
  const [searchName, setSearchName] = useState("");
  const [searchAddress, setSearchAddress] = useState("");

  const filteredShops = MOCK_SHOPS.filter((shop) => {
    const matchesName =
      searchName.trim() === "" ||
      shop.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesAddress =
      searchAddress.trim() === "" ||
      shop.address.toLowerCase().includes(searchAddress.toLowerCase());
    return matchesName && matchesAddress;
  });

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

        {/* Shop cards grid */}
        {filteredShops.length > 0 ? (
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-card) shadow-[0_2px_12px_var(--color-shadow-sm)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_4px_20px_var(--color-shadow-md)]"
              >
                {/* Shop image */}
                <div className="relative h-48 w-full sm:h-52">
                  <Image
                    src={shop.image}
                    alt={shop.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Card body */}
                <div className="p-4">
                  {/* Name + View menu button */}
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-foreground truncate text-base font-bold">
                      {shop.name}
                    </h3>
                    <Link
                      href="/"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-(--color-primary) px-3.5 py-2 text-xs font-semibold text-white no-underline transition-all duration-150 hover:bg-(--color-primary-dark) active:scale-95"
                    >
                      <i className="fa-solid fa-book-open text-[10px]"></i>
                      Xem menu
                    </Link>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-sm text-(--color-text-muted)">
                    <i className="fa-solid fa-location-dot mt-0.5 shrink-0 text-(--color-accent)"></i>
                    <span>{shop.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="mb-10 flex flex-col items-center justify-center gap-4 py-24 text-(--color-text-muted)">
            <i className="fa-solid fa-store text-5xl opacity-30"></i>
            <p className="text-base font-medium">
              Không tìm thấy quán nào phù hợp
            </p>
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

        {/* Filter / Search bar */}
        <div className="sticky bottom-0 rounded-2xl border border-(--color-border) bg-(--color-bg-card) p-4 shadow-[0_-2px_16px_var(--color-shadow-sm)] md:p-5">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {/* Label */}
            <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-(--color-text-secondary)">
              <i className="fa-solid fa-filter text-(--color-primary)"></i>
              <span>Lọc quán</span>
            </div>

            {/* Search by name */}
            <div className="relative min-w-0 flex-1">
              <i className="fa-solid fa-store pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-(--color-text-muted)"></i>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Tìm theo tên quán..."
                className="bg-background text-foreground focus:ring-opacity-20 w-full rounded-xl border border-(--color-border) py-2.5 pr-9 pl-9 text-sm transition-all duration-150 outline-none placeholder:text-(--color-text-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)"
              />
              {searchName && (
                <button
                  onClick={() => setSearchName("")}
                  aria-label="Xóa tìm kiếm tên"
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 text-(--color-text-muted) transition-colors duration-150 hover:text-(--color-primary)"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              )}
            </div>

            {/* Search by address */}
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
