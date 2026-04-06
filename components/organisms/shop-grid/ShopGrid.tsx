"use client";

import { ShopCard } from "@/components/molecules/cards";
import { MOCK_SHOPS } from "@/lib/constants";

import type { ShopGridProps } from "./ShopGrid.types";

export default function ShopGrid({
  searchName = "",
  searchAddress = "",
}: ShopGridProps) {
  const filtered = MOCK_SHOPS.filter((shop) => {
    const matchesName =
      searchName.trim() === "" ||
      shop.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesAddress =
      searchAddress.trim() === "" ||
      shop.address.toLowerCase().includes(searchAddress.toLowerCase());
    return matchesName && matchesAddress;
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-(--color-text-muted)">
        <i className="fa-solid fa-store text-5xl opacity-30"></i>
        <p className="text-base font-medium">Không tìm thấy quán nào phù hợp</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((shop) => (
        <ShopCard
          key={shop.id}
          id={shop.id}
          name={shop.name}
          address={shop.address}
          image={shop.image}
        />
      ))}
    </div>
  );
}
