"use client";

import { Button, Caption, Icon, Text } from "@/components/atoms";
import { formatVND } from "@/lib/utils/currency";
import Image from "next/image";

import type { ProductCardProps } from "./Card.types";

/**
 * Menu card for a product or combo: image (a mug icon shows if it fails to
 * load), name, description, price and a "Mua" button. It fills the width of
 * its grid cell, so the grid decides how many cards fit per row.
 * @param props.image Image URL.
 * @param props.imageAlt Alt text for the image.
 * @param props.productName Name shown and used in the button's label.
 * @param props.price A number is formatted as VND; a string is shown as is.
 * @param props.description Up to two lines are shown.
 * @param props.badge Small tag before the name, e.g. "Combo".
 * @param props.onBuy Called when "Mua" is pressed.
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
    // Under 480px the card lies flat (image left, text right) so a phone
    // shows four or five drinks per screen instead of one.
    <div className="flex w-full cursor-default flex-row overflow-hidden rounded-2xl border border-(--color-border-light) bg-(--color-bg-card) shadow-[0_2px_8px_var(--color-shadow-sm)] transition-all duration-250 min-[480px]:flex-col hover:min-[480px]:-translate-y-0.5 hover:min-[480px]:shadow-[0_6px_20px_var(--color-shadow-md)]">
      <div className="relative w-28 shrink-0 self-stretch overflow-hidden bg-(--color-border-light) min-[480px]:h-36 min-[480px]:w-full">
        {/* Fallback icon (shown when image fails or is missing) */}
        <div className="absolute inset-0 z-0 flex items-center justify-center text-4xl text-(--color-border)">
          <Icon name="mug-hot" />
        </div>
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="z-1 object-cover"
          sizes="(max-width: 479px) 112px, (max-width: 1024px) 50vw, 25vw"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
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

        <div className="flex shrink-0 items-center justify-between px-3 pt-1 pb-2.5 min-[480px]:border-t min-[480px]:border-(--color-border-light) min-[480px]:pt-2.5">
          <Text variant="body2" className="font-bold">
            {formattedPrice}
          </Text>
          <Button
            onClick={onBuy}
            variant="primary"
            size="sm"
            icon="cart-plus"
            aria-label={`Mua ${productName}`}
          >
            Mua
          </Button>
        </div>
      </div>
    </div>
  );
}
