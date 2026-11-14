import { StaffLayout } from "@/components/templates/staff-layout";

/**
 * Layout of the staff route group.
 * @param props.children Page content.
 */
export default function StaffRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffLayout>{children}</StaffLayout>;
}
