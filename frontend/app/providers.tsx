"use client";

import { AuthProvider } from "@/lib/contexts/auth-context";
import { CartProvider } from "@/lib/contexts/cart-context";

/**
 * Client-side providers wrapper.
 * Placed here so the server-only app/layout.tsx can wrap its children
 * with client context providers without becoming a client component itself.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
