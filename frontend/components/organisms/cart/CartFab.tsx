"use client";

import { Icon } from "@/components/atoms";
import { useCart } from "@/lib/contexts/cart-context";
import Link from "next/link";

/**
 * Floating cart button linking to checkout, with the item count. Hidden while
 * the cart is empty.
 */
export default function CartFab() {
  const { totalItems } = useCart();

  if (totalItems <= 0) return null;

  return (
    <Link
      href="/checkout"
      aria-label="Đi đến trang thanh toán"
      className="fixed right-5 bottom-6 z-70 flex h-14 w-14 items-center justify-center rounded-full bg-(--color-primary) text-white shadow-xl transition-all duration-150 hover:bg-(--color-primary-dark) active:scale-95"
    >
      <Icon name="cart-shopping" className="text-lg" />
      <span className="absolute -top-1.5 -right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-(--color-accent) px-1.5 text-xs font-bold text-(--color-primary-dark)">
        {totalItems}
      </span>
    </Link>
  );
}
