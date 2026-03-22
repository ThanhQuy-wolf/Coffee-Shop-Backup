"use client";

import { MenuProvider } from "@/lib/menu-context";

/**
 * Client-side providers wrapper.
 * Placed here so the server-only app/layout.tsx can wrap its children
 * with client context providers without becoming a client component itself.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MenuProvider>{children}</MenuProvider>;
}
