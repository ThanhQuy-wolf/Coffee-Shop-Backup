"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MOCK_SHOPS } from "@/lib/constants";

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
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Khám phá quán nước
          </h1>
          <p className="text-sm text-(--color-text-muted) mt-1">
            Tìm và chọn quán yêu thích của bạn
          </p>
        </div>

        {/* Shop cards grid */}
        {filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="bg-(--color-bg-card) rounded-2xl border border-(--color-border)
                           shadow-[0_2px_12px_var(--color-shadow-sm)]
                           overflow-hidden
                           hover:shadow-[0_4px_20px_var(--color-shadow-md)]
                           hover:-translate-y-1
                           transition-all duration-250"
              >
                {/* Shop image */}
                <div className="relative w-full h-48 sm:h-52">
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
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-bold text-base text-foreground truncate">
                      {shop.name}
                    </h3>
                    <Link
                      href="/"
                      className="shrink-0 inline-flex items-center gap-1.5
                                 px-3.5 py-2 rounded-xl text-xs font-semibold
                                 bg-(--color-primary) text-white
                                 hover:bg-(--color-primary-dark)
                                 active:scale-95
                                 transition-all duration-150 no-underline"
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
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-(--color-text-muted) mb-10">
            <i className="fa-solid fa-store text-5xl opacity-30"></i>
            <p className="text-base font-medium">
              Không tìm thấy quán nào phù hợp
            </p>
            <button
              onClick={() => {
                setSearchName("");
                setSearchAddress("");
              }}
              className="text-sm text-(--color-primary) hover:underline cursor-pointer
                         border-none bg-transparent"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Filter / Search bar */}
        <div
          className="sticky bottom-0 bg-(--color-bg-card) border border-(--color-border)
                     rounded-2xl shadow-[0_-2px_16px_var(--color-shadow-sm)]
                     p-4 md:p-5"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Label */}
            <div className="flex items-center gap-2 shrink-0 text-sm font-semibold text-(--color-text-secondary)">
              <i className="fa-solid fa-filter text-(--color-primary)"></i>
              <span>Lọc quán</span>
            </div>

            {/* Search by name */}
            <div className="relative flex-1 min-w-0">
              <i
                className="fa-solid fa-store absolute left-3 top-1/2 -translate-y-1/2
                           text-xs text-(--color-text-muted) pointer-events-none"
              ></i>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Tìm theo tên quán..."
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border outline-none
                           bg-background text-foreground
                           border-(--color-border) placeholder:text-(--color-text-muted)
                           focus:border-(--color-primary) focus:ring-2
                           focus:ring-(--color-primary) focus:ring-opacity-20
                           transition-all duration-150"
              />
              {searchName && (
                <button
                  onClick={() => setSearchName("")}
                  aria-label="Xóa tìm kiếm tên"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)
                             hover:text-(--color-primary) transition-colors duration-150
                             cursor-pointer border-none bg-transparent p-0"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              )}
            </div>

            {/* Search by address */}
            <div className="relative flex-1 min-w-0">
              <i
                className="fa-solid fa-location-dot absolute left-3 top-1/2 -translate-y-1/2
                           text-xs text-(--color-text-muted) pointer-events-none"
              ></i>
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Tìm theo địa chỉ..."
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border outline-none
                           bg-background text-foreground
                           border-(--color-border) placeholder:text-(--color-text-muted)
                           focus:border-(--color-primary) focus:ring-2
                           focus:ring-(--color-primary) focus:ring-opacity-20
                           transition-all duration-150"
              />
              {searchAddress && (
                <button
                  onClick={() => setSearchAddress("")}
                  aria-label="Xóa tìm kiếm địa chỉ"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)
                             hover:text-(--color-primary) transition-colors duration-150
                             cursor-pointer border-none bg-transparent p-0"
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
