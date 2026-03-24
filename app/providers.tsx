"use client";

import { MenuProvider } from "@/lib/menu-context";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";

/**
 * Client-side providers wrapper.
 * Placed here so the server-only app/layout.tsx can wrap its children
 * with client context providers without becoming a client component itself.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MenuProvider>
        <CartProvider>{children}</CartProvider>
      </MenuProvider>
    </AuthProvider>
  );
}
