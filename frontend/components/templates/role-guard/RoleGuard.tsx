"use client";

import { Spinner } from "@/components/atoms";
import { homePathFor, useAuth } from "@/lib/contexts/auth-context";
import type { UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

export interface RoleGuardProps {
  /** Roles allowed to see the children. */
  allow: UserRole[];
  children: ReactNode;
}

/**
 * Client-side route guard. Shows a spinner while the saved session loads,
 * sends a guest to /login, and sends a signed-in user whose role is not
 * allowed to their own home page (FR-04).
 * @param props.allow Roles allowed to see the children.
 * @param props.children Protected content.
 */
export default function RoleGuard({ allow, children }: RoleGuardProps) {
  const { user, isReady } = useAuth();
  const router = useRouter();

  const allowed = !!user && allow.includes(user.role);

  useEffect(() => {
    if (!isReady || allowed) return;
    router.replace(user ? homePathFor(user.role) : "/login");
  }, [isReady, allowed, user, router]);

  if (!allowed) {
    return (
      <Spinner
        label="Đang kiểm tra quyền truy cập..."
        className="bg-background min-h-screen flex-col"
      />
    );
  }

  return <>{children}</>;
}
