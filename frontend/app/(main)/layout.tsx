import { MainLayout } from "@/components/templates/main-layout";

/**
 * Layout of the customer route group.
 * @param props.children Page content.
 */
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
