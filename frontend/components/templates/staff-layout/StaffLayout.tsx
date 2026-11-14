"use client";

import { RoleGuard } from "@/components/templates/role-guard";

import type { StaffLayoutProps } from "./StaffLayout.types";

/**
 * Layout of the staff pages, open to staff and the manager.
 * @param props.children Page content.
 */
export default function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <RoleGuard allow={["STAFF", "MANAGER"]}>
      <div className="bg-background flex min-h-screen flex-col">{children}</div>
    </RoleGuard>
  );
}
