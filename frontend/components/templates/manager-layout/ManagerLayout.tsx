"use client";

import { RoleGuard } from "@/components/templates/role-guard";
import { useAuth } from "@/lib/contexts/auth-context";
import { CatalogProvider } from "@/lib/contexts/catalog-context";
import { ManagerProvider } from "@/lib/contexts/manager-context";

import type { ManagerLayoutProps } from "./ManagerLayout.types";

function WithCatalog({ children }: ManagerLayoutProps) {
  const { user } = useAuth();
  return (
    <CatalogProvider shopId={user!.shopId!}>
      <ManagerProvider>
        <div className="bg-background flex min-h-screen flex-col">
          {children}
        </div>
      </ManagerProvider>
    </CatalogProvider>
  );
}

/** Managers only. */
export default function ManagerLayout({ children }: ManagerLayoutProps) {
  return (
    <RoleGuard allow={["MANAGER"]}>
      <WithCatalog>{children}</WithCatalog>
    </RoleGuard>
  );
}
