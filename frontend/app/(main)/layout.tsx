import { MainLayout } from "@/components/templates/main-layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
