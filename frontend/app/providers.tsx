"use client";

import { AuthProvider } from "@/lib/contexts/auth-context";
import { CartProvider } from "@/lib/contexts/cart-context";

/**
 * Client-side providers (auth and cart). They live here so the server-only
 * app/layout.tsx can use them without becoming a client component itself.
 * @param props.children The rest of the app.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
