import { ManagerLayout } from "@/components/templates/manager-layout";

/**
 * Layout of the manager route group.
 * @param props.children Page content.
 */
export default function ManagerRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ManagerLayout>{children}</ManagerLayout>;
}
