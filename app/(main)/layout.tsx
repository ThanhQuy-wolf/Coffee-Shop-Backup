import Header from "@/layouts/header";
import Footer from "@/layouts/footer";
import CartFab from "@/components/CartFab";

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
