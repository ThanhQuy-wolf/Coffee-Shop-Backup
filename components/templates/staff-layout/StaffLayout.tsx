"use client";

import { useAuth } from "@/lib/auth-context";
import { ShiftProvider } from "@/lib/shift-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { StaffLayoutProps } from "./StaffLayout.types";

/**
 * Staff layout template — wraps content with auth guard and ShiftProvider.
 * Allows both staff and manager roles; redirects customers away.
 */
export default function StaffLayout({ children }: StaffLayoutProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user !== null && user.role === "customer") {
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

  if (user.role === "customer") return null;

  return (
    <ShiftProvider>
      <div className="bg-background flex min-h-screen flex-col">{children}</div>
    </ShiftProvider>
  );
}
