import { CartFab } from "@/components/organisms/cart";
import Footer from "@/layouts/footer";
import Header from "@/layouts/header";

import type { MainLayoutProps } from "./MainLayout.types";

/**
 * Main layout template — wraps content with Header, Footer, and CartFab.
 * Used by the (main) route group layout.
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      {/* Sticky top header */}
      <Header />

      {/* Page content (grows to fill remaining height) */}
      <div className="flex-1">{children}</div>

      {/* Footer always at bottom */}
      <Footer />

      {/* Global floating cart button */}
      <CartFab />
    </>
  );
}
