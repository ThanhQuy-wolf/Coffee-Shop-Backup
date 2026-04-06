import Image from "next/image";
import Link from "next/link";

import type { ShopCardProps } from "./Card.types";

export default function ShopCard({ name, address, image }: ShopCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-card) shadow-[0_2px_12px_var(--color-shadow-sm)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_4px_20px_var(--color-shadow-md)]">
      {/* Shop image */}
      <div className="relative h-48 w-full sm:h-52">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-foreground truncate text-base font-bold">
            {name}
          </h3>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-(--color-primary) px-3.5 py-2 text-xs font-semibold text-white no-underline transition-all duration-150 hover:bg-(--color-primary-dark) active:scale-95"
          >
            <i className="fa-solid fa-book-open text-[10px]"></i>
            Xem menu
          </Link>
        </div>

        <div className="flex items-start gap-2 text-sm text-(--color-text-muted)">
          <i className="fa-solid fa-location-dot mt-0.5 shrink-0 text-(--color-accent)"></i>
          <span>{address}</span>
        </div>
      </div>
    </div>
  );
}
