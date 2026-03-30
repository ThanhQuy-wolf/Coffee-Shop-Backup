import CartFab from "@/components/CartFab";
import Footer from "@/layouts/footer";
import Header from "@/layouts/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
