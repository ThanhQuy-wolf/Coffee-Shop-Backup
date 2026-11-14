"use client";

import { Button, Caption, Text } from "@/components/atoms";
import { formatVND } from "@/lib/utils/currency";
import Image from "next/image";

import type { ProductCardProps } from "./Card.types";

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
export default function ProductCard({
  image,
  imageAlt = "Ảnh sản phẩm",
  productName,
  price,
  description,
  badge,
  onBuy,
}: ProductCardProps) {
  const formattedPrice = typeof price === "number" ? formatVND(price) : price;

  return (
    <div className="flex w-full cursor-default flex-col overflow-hidden rounded-2xl border border-(--color-border-light) bg-(--color-bg-card) shadow-[0_2px_8px_var(--color-shadow-sm)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_var(--color-shadow-md)]">
      {/* ── Image area ── */}
      <div className="relative h-36 w-full shrink-0 overflow-hidden bg-(--color-border-light)">
        {/* Fallback icon (shown when image fails or is missing) */}
        <div className="absolute inset-0 z-0 flex items-center justify-center text-4xl text-(--color-border)">
          <i className="fa-solid fa-mug-hot"></i>
        </div>
        {/* Product image */}
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="z-1 object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* ── Name + description ── */}
      <div className="flex flex-1 flex-col gap-1 px-3 pt-2.5 pb-1.5">
        <h3 className="text-foreground line-clamp-1 text-sm leading-tight font-bold">
          {badge && (
            <span className="mr-1.5 rounded-md bg-(--color-accent-light) px-1.5 py-0.5 text-[10px] font-semibold text-(--color-primary-dark)">
              {badge}
            </span>
          )}
          {productName}
        </h3>
        <Caption className="line-clamp-2">{description}</Caption>
      </div>

      {/* ── Price + Buy button ── */}
      <div className="flex shrink-0 items-center justify-between border-t border-(--color-border-light) px-3 py-2.5">
        <Text variant="body2" className="font-bold">
          {formattedPrice}
        </Text>
        <Button
          onClick={onBuy}
          variant="primary"
          size="sm"
          icon="fa-cart-plus"
          aria-label={`Mua ${productName}`}
        >
          Mua
        </Button>
      </div>
    </div>
  );
}
