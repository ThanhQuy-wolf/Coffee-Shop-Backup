import { ShopCard } from "@/components/molecules/cards";

import type { ShopGridProps } from "./ShopGrid.types";

export default function ShopGrid({ shops }: ShopGridProps) {
  if (shops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-(--color-text-muted)">
        <i className="fa-solid fa-store text-5xl opacity-30"></i>
        <p className="text-base font-medium">Không tìm thấy quán nào phù hợp</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shops.map((shop) => (
        <ShopCard
          key={shop.id}
          id={shop.id}
          name={shop.name}
          address={shop.address}
          image={shop.coverImageUrl}
        />
      ))}
    </div>
  );
}
