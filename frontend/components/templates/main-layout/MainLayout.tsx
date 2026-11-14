import { CartFab } from "@/components/organisms/cart";
import Footer from "@/layouts/footer";
import Header from "@/layouts/header";

import type { MainLayoutProps } from "./MainLayout.types";

/**
 * Layout of the customer pages: sticky header, content that fills the
 * remaining height, footer and the floating cart button.
 * @param props.children Page content.
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Header />

      <div className="flex-1">{children}</div>

      <Footer />

      <CartFab />
    </>
  );
}
