"use client";

import { useAuth } from "@/lib/auth-context";
import { SHOP_INFO } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Site Header — sticky top bar, always visible on all screen sizes.
 *
 * 2-column layout:
 *   [LEFT: Brand (logo + name + tagline)] | [RIGHT: Auth button]
 *
 * Auth states:
 *   - Guest: Shows "Đăng nhập" button → navigates to /login
 *   - Manager: Shows "Quản lý" badge with logout on click
 *   - Staff: Shows staff name with logout on click
 *   - Customer: Shows "Khách hàng" with phone and logout on click
 *
 * Responsive:
 *   - Logo + shop name : always visible
 *   - Tagline          : hidden on mobile (< md), shown on md+
 *   - Button label     : hidden on xs (< sm), shown on sm+
 */
export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleAuthClick = () => {
    if (!user) {
      router.push("/login");
    } else {
      logout();
    }
  };

  return (
    <header className="sticky top-0 z-50 h-(--spacing-header-height) w-full border-b border-(--color-border) bg-(--color-bg-header) shadow-[0_1px_8px_var(--color-shadow-sm)]">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between gap-6 px-6 md:px-8 lg:px-12">
        {/* ── LEFT: Brand ── */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-4 no-underline"
        >
          {/* Logo */}
          <div className="relative h-10 w-10 shrink-0 md:h-11 md:w-11">
            <Image
              src={SHOP_INFO.logo}
              alt={`Logo ${SHOP_INFO.name}`}
              fill
              className="object-contain transition-transform duration-200 group-hover:scale-105"
              sizes="44px"
              priority
            />
          </div>

          {/* Name + tagline */}
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-(--color-primary-dark) transition-colors duration-150 group-hover:text-(--color-primary) md:text-lg">
              {SHOP_INFO.name}
            </span>
            <span className="hidden text-xs text-(--color-text-muted) md:block">
              {SHOP_INFO.tagline}
            </span>
          </div>
        </Link>

        {/* ── RIGHT: Auth ── */}
        <div className="flex shrink-0 items-center gap-3">
          {!user ? (
            /* Guest: sign-in button */
            <button
              onClick={handleAuthClick}
              title="Đăng nhập"
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border-none bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-(--color-primary-dark) active:scale-95"
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              <span className="hidden sm:inline">Đăng nhập</span>
            </button>
          ) : user.role === "manager" ? (
            /* Manager: dashboard link + logout */
            <div className="flex items-center gap-2">
              <Link
                href="/manager"
                className="flex items-center gap-2 rounded-xl border border-(--color-accent) bg-(--color-accent-light) px-4 py-2.5 text-sm font-semibold text-(--color-primary-dark) no-underline transition-all duration-150 hover:bg-(--color-accent) hover:text-white"
              >
                <i className="fa-solid fa-user-tie text-base"></i>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                onClick={handleAuthClick}
                title="Đăng xuất"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-(--color-border) bg-transparent px-3 py-2.5 text-sm font-medium text-(--color-text-muted) transition-all duration-150 hover:border-red-300 hover:bg-red-50 hover:text-red-500 active:scale-95"
              >
                <i className="fa-solid fa-right-from-bracket text-base"></i>
              </button>
            </div>
          ) : user.role === "staff" ? (
            /* Staff: avatar + name */
            <button
              onClick={handleAuthClick}
              title="Nhấn để đăng xuất"
              className="bg-background flex cursor-pointer items-center gap-2.5 rounded-xl border border-(--color-border) px-4 py-2 text-sm font-semibold text-(--color-text-secondary) transition-all duration-150 hover:border-(--color-primary-light) hover:bg-(--color-border-light) active:scale-95"
            >
              {/* Avatar circle */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--color-primary-light) text-xs text-white">
                <i className="fa-solid fa-user"></i>
              </div>
              <span className="hidden sm:inline">{user.name}</span>
            </button>
          ) : (
            /* Customer: phone icon + label */
            <button
              onClick={handleAuthClick}
              title={`Khách hàng - ${user.phone || ""} - Nhấn để đăng xuất`}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border-none bg-(--color-primary-light) px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-(--color-primary) active:scale-95"
            >
              {/* Customer icon */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs text-(--color-primary-light)">
                <i className="fa-solid fa-user"></i>
              </div>
              <span className="hidden sm:inline">Khách hàng</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
