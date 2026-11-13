import { formatVND } from "@/lib/utils/currency";
import { HTMLAttributes } from "react";

export interface PriceBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  price: number;
  currency?: string;
  className?: string;
}

export default function PriceBadge({
  price,
  currency = "VND",
  className = "",
  ...props
}: PriceBadgeProps) {
  const formattedPrice =
    currency === "VND" ? formatVND(price) : `${price.toFixed(2)} ${currency}`;

  return (
    <span
      className={`text-sm font-bold text-(--color-primary) ${className}`}
      {...props}
    >
      {formattedPrice}
    </span>
  );
}
