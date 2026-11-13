"use client";

import { RoleGuard } from "@/components/templates/role-guard";
import { ManagerProvider } from "@/lib/contexts/manager-context";

import type { ManagerLayoutProps } from "./ManagerLayout.types";

/**
 * Manager layout template — only managers; wraps content with ManagerProvider.
 */
export default function ManagerLayout({ children }: ManagerLayoutProps) {
  return (
    <RoleGuard allow={["manager"]}>
      <ManagerProvider>
        <div className="bg-background flex min-h-screen flex-col">
          {children}
        </div>
      </ManagerProvider>
    </RoleGuard>
  );
}
