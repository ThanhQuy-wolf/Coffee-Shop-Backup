"use client";

import { RoleGuard } from "@/components/templates/role-guard";
import { ShiftProvider } from "@/lib/contexts/shift-context";

import type { StaffLayoutProps } from "./StaffLayout.types";

/**
 * Staff layout template — staff and managers; wraps content with ShiftProvider.
 */
export default function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <RoleGuard allow={["staff", "manager"]}>
      <ShiftProvider>
        <div className="bg-background flex min-h-screen flex-col">
          {children}
        </div>
      </ShiftProvider>
    </RoleGuard>
  );
}
