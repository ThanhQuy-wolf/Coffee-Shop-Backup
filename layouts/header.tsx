"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SHOP_INFO, MOCK_USERS } from "@/lib/constants";
import type { User } from "@/lib/types";

/**
 * Site Header — sticky top bar, always visible on all screen sizes.
 *
 * 2-column layout:
 *   [LEFT: Brand (logo + name + tagline)] | [RIGHT: Auth button]
 *
 * Auth state cycles for UI demo (click the button to switch):
 *   Guest  →  Manager (Quản lý)  →  Staff  →  Guest
 *
 * Responsive:
 *   - Logo + shop name : always visible
 *   - Tagline          : hidden on mobile (< md), shown on md+
 *   - Button label     : hidden on xs (< sm), shown on sm+
 */
export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  const cycleUser = () => {
    if (!user) setUser(MOCK_USERS.manager);
    else if (user.role === "manager") setUser(MOCK_USERS.staff);
    else setUser(null);
  };

  return (
    <header
      className="w-full sticky top-0 z-50
                 bg-(--color-bg-header) border-b border-(--color-border)
                 shadow-[0_1px_8px_var(--color-shadow-sm)]
                 h-(--spacing-header-height)"
    >
      <div
        className="h-full px-6 md:px-8 lg:px-12
                   flex items-center justify-between gap-6
                   max-w-screen-2xl mx-auto"
      >

        {/* ── LEFT: Brand ── */}
        <Link
          href="/"
          className="flex items-center gap-4 shrink-0 no-underline group"
        >
          {/* Logo */}
          <div className="relative w-10 h-10 md:w-11 md:h-11 shrink-0">
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
            <span
              className="font-bold text-base md:text-lg
                         text-(--color-primary-dark)
                         group-hover:text-(--color-primary)
                         transition-colors duration-150"
            >
              {SHOP_INFO.name}
            </span>
            <span className="text-xs hidden md:block text-(--color-text-muted)">
              {SHOP_INFO.tagline}
            </span>
          </div>
        </Link>

        {/* ── RIGHT: Auth ── */}
        <div className="flex items-center gap-3 shrink-0">

          {!user ? (
            /* Guest: sign-in button */
            <button
              onClick={cycleUser}
              title="Đăng nhập"
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl
                         text-sm font-semibold border-none cursor-pointer
                         bg-(--color-primary) text-white
                         hover:bg-(--color-primary-dark)
                         active:scale-95 transition-all duration-150"
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              <span className="hidden sm:inline">Đăng nhập</span>
            </button>

          ) : user.role === "manager" ? (
            /* Manager: gold badge */
            <button
              onClick={cycleUser}
              title="Nhấn để đổi tài khoản (demo)"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                         text-sm font-semibold cursor-pointer
                         bg-(--color-accent-light) border border-(--color-accent)
                         text-(--color-primary-dark)
                         hover:bg-(--color-accent) hover:text-white
                         active:scale-95 transition-all duration-150"
            >
              <i className="fa-solid fa-user-tie text-base"></i>
              <span className="hidden sm:inline">Quản lý</span>
            </button>

          ) : (
            /* Staff / regular user: avatar + name */
            <button
              onClick={cycleUser}
              title="Nhấn để đổi tài khoản (demo)"
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl
                         text-sm font-semibold cursor-pointer
                         bg-background border border-(--color-border)
                         text-(--color-text-secondary)
                         hover:border-(--color-primary-light)
                         hover:bg-(--color-border-light)
                         active:scale-95 transition-all duration-150"
            >
              {/* Avatar circle */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0
                           bg-(--color-primary-light) text-white text-xs"
              >
                <i className="fa-solid fa-user"></i>
              </div>
              <span className="hidden sm:inline">{user.name}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
