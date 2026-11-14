"use client";

import { RoleGuard } from "@/components/templates/role-guard";

import type { StaffLayoutProps } from "./StaffLayout.types";

/** Staff and managers of a shop. */
export default function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <RoleGuard allow={["STAFF", "MANAGER"]}>
      <div className="bg-background flex min-h-screen flex-col">{children}</div>
    </RoleGuard>
  );
}
