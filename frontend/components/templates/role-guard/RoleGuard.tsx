"use client";

import { useAuth } from "@/lib/contexts/auth-context";
import type { UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

export interface RoleGuardProps {
  /** Roles allowed to see the children */
  allow: UserRole[];
  children: ReactNode;
}

/**
 * Client-side route guard.
 *   - while the saved session is loading → spinner
 *   - not logged in                       → redirect to /login
 *   - logged in with a role not allowed   → redirect to /
 */
export default function RoleGuard({ allow, children }: RoleGuardProps) {
  const { user, isReady } = useAuth();
  const router = useRouter();

  const allowed = !!user && allow.includes(user.role);

  useEffect(() => {
    if (!isReady || allowed) return;
    router.replace(user ? "/" : "/login");
  }, [isReady, allowed, user, router]);

  if (!allowed) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-(--color-text-muted)">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-(--color-primary)"></i>
          <p className="text-sm">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
