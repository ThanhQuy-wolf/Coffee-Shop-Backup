"use client";

import { RoleGuard } from "@/components/templates/role-guard";
import { CatalogProvider } from "@/lib/contexts/catalog-context";
import { ManagerProvider } from "@/lib/contexts/manager-context";

import type { ManagerLayoutProps } from "./ManagerLayout.types";

/**
 * Provides the catalog and manager contexts to the manager pages.
 * @param props.children Page content.
 */
function WithCatalog({ children }: ManagerLayoutProps) {
  return (
    <CatalogProvider>
      <ManagerProvider>
        <div className="bg-background flex min-h-screen flex-col">
          {children}
        </div>
      </ManagerProvider>
    </CatalogProvider>
  );
}

/**
 * Layout of the manager pages. Only the manager gets in; the catalog is
 * loaded once for all tabs.
 * @param props.children Page content.
 */
export default function ManagerLayout({ children }: ManagerLayoutProps) {
  return (
    <RoleGuard allow={["MANAGER"]}>
      <WithCatalog>{children}</WithCatalog>
    </RoleGuard>
  );
}
