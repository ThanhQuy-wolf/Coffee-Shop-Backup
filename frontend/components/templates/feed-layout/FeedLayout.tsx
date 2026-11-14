import { CartFab } from "@/components/organisms/cart";
import Header from "@/layouts/header";

import type { FeedLayoutProps } from "./FeedLayout.types";

/** Feed layout template — shared header, no footer, floating cart. */
export default function FeedLayout({ children }: FeedLayoutProps) {
  return (
    <>
      <Header />
      <div className="flex-1">{children}</div>
      <CartFab />
    </>
  );
}
