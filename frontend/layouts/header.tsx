"use client";

import { NotificationBell } from "@/components/molecules/notification-bell";
import { PLATFORM_INFO } from "@/lib/constants";
import { useAuth } from "@/lib/contexts/auth-context";
import type { UserRole } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
  icon: string;
}

const NAV_BY_ROLE: Record<UserRole, NavLink[]> = {
  CUSTOMER: [{ href: "/orders", label: "Đơn của tôi", icon: "fa-receipt" }],
  STAFF: [
    { href: "/staff/orders", label: "Đơn hàng", icon: "fa-receipt" },
    { href: "/staff/schedule", label: "Ca làm", icon: "fa-calendar-check" },
  ],
  MANAGER: [
    { href: "/manager", label: "Quản lý", icon: "fa-user-tie" },
    { href: "/staff/orders", label: "Đơn hàng", icon: "fa-receipt" },
    { href: "/staff/schedule", label: "Ca làm", icon: "fa-calendar-check" },
  ],
};

const ROLE_LABEL: Record<UserRole, string> = {
  CUSTOMER: "Khách hàng",
  STAFF: "Nhân viên",
  MANAGER: "Quản lý",
};

/**
 * Sticky top bar: platform brand on the left, role-based links, notifications
 * and the account button on the right.
 */
export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 h-(--spacing-header-height) w-full border-b border-(--color-border) bg-(--color-bg-header) shadow-[0_1px_8px_var(--color-shadow-sm)]">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between gap-4 px-4 md:px-8 lg:px-12">
        <Link
          href="/feed"
          className="group flex shrink-0 items-center gap-3 no-underline"
        >
          <div className="relative h-10 w-10 shrink-0 md:h-11 md:w-11">
            <Image
              src={PLATFORM_INFO.logo}
              alt={`Logo ${PLATFORM_INFO.name}`}
              fill
              className="object-contain transition-transform duration-200 group-hover:scale-105"
              sizes="44px"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-(--color-primary-dark) transition-colors duration-150 group-hover:text-(--color-primary) md:text-lg">
              {PLATFORM_INFO.name}
            </span>
            <span className="hidden text-xs text-(--color-text-muted) md:block">
              {PLATFORM_INFO.tagline}
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          {!user ? (
            <button
              onClick={() => router.push("/login")}
              title="Đăng nhập"
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border-none bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-(--color-primary-dark) active:scale-95"
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              <span className="hidden sm:inline">Đăng nhập</span>
            </button>
          ) : (
            <>
              {NAV_BY_ROLE[user.role].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  title={link.label}
                  className="flex items-center gap-2 rounded-xl border border-(--color-accent) bg-(--color-accent-light) px-3 py-2.5 text-sm font-semibold text-(--color-primary-dark) no-underline transition-all duration-150 hover:bg-(--color-accent) hover:text-white"
                >
                  <i className={`fa-solid ${link.icon}`}></i>
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              ))}
              <NotificationBell />
              <button
                onClick={() => {
                  logout();
                  router.push("/feed");
                }}
                title={`${user.fullName} (${ROLE_LABEL[user.role]}) - Nhấn để đăng xuất`}
                aria-label="Đăng xuất"
                className="bg-background flex cursor-pointer items-center gap-2 rounded-xl border border-(--color-border) px-3 py-2 text-sm font-semibold text-(--color-text-secondary) transition-all duration-150 hover:border-red-300 hover:bg-red-50 hover:text-red-500 active:scale-95"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--color-primary-light) text-[10px] text-white">
                  <i className="fa-solid fa-user"></i>
                </span>
                <span className="hidden max-w-32 truncate md:inline">
                  {user.fullName}
                </span>
                <i className="fa-solid fa-right-from-bracket text-xs"></i>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
