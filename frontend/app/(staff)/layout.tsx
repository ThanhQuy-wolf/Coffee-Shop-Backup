import { StaffLayout } from "@/components/templates/staff-layout";

export default function RootStaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffLayout>{children}</StaffLayout>;
}
