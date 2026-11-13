"use client";

import { AuthProvider } from "@/lib/contexts/auth-context";
import { CartProvider } from "@/lib/contexts/cart-context";
import { CatalogProvider } from "@/lib/contexts/catalog-context";
import { MenuProvider } from "@/lib/contexts/menu-context";

/**
 * Client-side providers wrapper.
 * Placed here so the server-only app/layout.tsx can wrap its children
 * with client context providers without becoming a client component itself.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CatalogProvider>
        <MenuProvider>
          <CartProvider>{children}</CartProvider>
        </MenuProvider>
      </CatalogProvider>
    </AuthProvider>
  );
}
