"use client";

import { useAuth } from "@/lib/auth-context";
import { ManagerProvider } from "@/lib/manager-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { ManagerLayoutProps } from "./ManagerLayout.types";

/**
 * Manager layout template — wraps content with auth guard and ManagerProvider.
 * Redirects non-managers away; shows loading state while auth resolves.
 */
export default function ManagerLayout({ children }: ManagerLayoutProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user !== null && user.role !== "manager") {
      router.replace("/");
    }
  }, [user, router]);

  if (user === null) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-(--color-text-muted)">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-(--color-primary)"></i>
          <p className="text-sm">Đang kiểm tra quyền truy cập...</p>
          <Link
            href="/login"
            className="text-sm font-medium text-(--color-primary) hover:underline"
          >
            Đăng nhập nếu chưa có tài khoản
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "manager") return null;

  return (
    <ManagerProvider>
      <div className="bg-background flex min-h-screen flex-col">{children}</div>
    </ManagerProvider>
  );
}
