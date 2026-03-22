"use client";

import Image from "next/image";

interface CartProductProps {
  image: string;
  imageAlt?: string;
  productName: string;
  price: number | string;
  description: string;
  onBuy?: () => void;
}

/**
 * Product card — fills the parent grid cell width (w-full).
 *
 * Layout (top → bottom):
 *   1. Image area (fixed height h-36) with coffee-mug fallback icon
 *   2. Name + description (flex-1, grows to fill space)
 *   3. Price + Buy button row (pinned to bottom)
 *
 * Responsive: card width is controlled by the parent grid, not the card itself.
 */
export default function CartProduct({
  image,
  imageAlt = "Ảnh sản phẩm",
  productName,
  price,
  description,
  onBuy,
}: CartProductProps) {
  const formattedPrice =
    typeof price === "number"
      ? price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
      : price;

  return (
    <div
      className="flex flex-col w-full rounded-2xl overflow-hidden
                 bg-(--color-bg-card) border border-(--color-border-light)
                 shadow-[0_2px_8px_var(--color-shadow-sm)]
                 hover:shadow-[0_6px_20px_var(--color-shadow-md)]
                 hover:-translate-y-0.5
                 transition-all duration-250 cursor-default"
    >
      {/* ── Image area ── */}
      <div className="relative w-full h-36 bg-(--color-border-light) shrink-0 overflow-hidden">
        {/* Fallback icon (shown when image fails or is missing) */}
        <div className="absolute inset-0 flex items-center justify-center text-4xl text-(--color-border) z-0">
          <i className="fa-solid fa-mug-hot"></i>
        </div>
        {/* Product image */}
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover z-1"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* ── Name + description ── */}
      <div className="flex-1 flex flex-col gap-1 px-3 pt-2.5 pb-1.5">
        <h3 className="font-bold text-sm leading-tight text-foreground line-clamp-1">
          {productName}
        </h3>
        <p className="text-xs leading-relaxed text-(--color-text-muted) line-clamp-2">
          {description}
        </p>
      </div>

      {/* ── Price + Buy button ── */}
      <div
        className="flex items-center justify-between px-3 py-2.5
                   border-t border-(--color-border-light) shrink-0"
      >
        <span className="text-sm font-bold text-(--color-primary)">
          {formattedPrice}
        </span>
        <button
          onClick={onBuy}
          className="flex items-center gap-1.5 text-xs font-semibold
                     px-3 py-1.5 rounded-lg border-none cursor-pointer
                     bg-(--color-primary) text-white
                     hover:bg-(--color-primary-dark)
                     active:scale-95
                     transition-all duration-150 whitespace-nowrap"
        >
          <i className="fa-solid fa-cart-plus"></i>
          Mua
        </button>
      </div>
    </div>
  );
}
