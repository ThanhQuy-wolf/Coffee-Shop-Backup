import { ManagerLayout } from "@/components/templates/manager-layout";

export default function RootManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ManagerLayout>{children}</ManagerLayout>;
}
