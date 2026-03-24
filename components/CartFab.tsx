"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartFab() {
  const { totalItems } = useCart();

  if (totalItems <= 0) return null;

  return (
    <Link
      href="/payment"
      aria-label="Đi đến trang thanh toán"
      className="fixed right-5 bottom-6 z-70 w-14 h-14 rounded-full
                 bg-(--color-primary) text-white shadow-xl
                 flex items-center justify-center
                 hover:bg-(--color-primary-dark)
                 active:scale-95 transition-all duration-150"
    >
      <i className="fa-solid fa-cart-shopping text-lg"></i>
      <span
        className="absolute -top-1.5 -right-1.5 min-w-6 h-6 px-1.5
                   rounded-full bg-(--color-accent) text-(--color-primary-dark)
                   text-xs font-bold flex items-center justify-center
                   border-2 border-white"
      >
        {totalItems}
      </span>
    </Link>
  );
}
