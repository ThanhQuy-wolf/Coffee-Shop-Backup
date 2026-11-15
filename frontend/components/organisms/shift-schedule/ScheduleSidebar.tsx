"use client";

import { Icon } from "@/components/atoms";
import { useAuth } from "@/lib/contexts/auth-context";
import { useShift } from "@/lib/contexts/shift-context";
import { formatVND } from "@/lib/utils/currency";
import Link from "next/link";

/**
 * Sidebar of the shift schedule from `lg` up: view switch, shortcuts, the
 * week's labour cost for the manager, and the signed-in user.
 */
export default function ScheduleSidebar() {
  const { user, logout } = useAuth();
  const { view, setView, goToToday, weeklyLaborCost } = useShift();
  const isManager = user?.role === "MANAGER";

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-(--color-border-light) bg-white shadow-sm lg:flex">
      <div className="flex items-center gap-3 border-b border-(--color-border-light) px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-primary)">
          <Icon name="calendar-days" className="text-sm text-white" />
        </div>
        <div>
          <p className="text-foreground text-sm font-bold">Lịch làm việc</p>
          <p className="text-xs text-(--color-text-muted)">
            {isManager ? "Manager" : "Staff"}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
          Chế độ xem
        </p>
        <button
          type="button"
          onClick={() => setView("week")}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3 py-2.5 text-sm font-medium transition-all ${
            view === "week"
              ? "bg-(--color-primary) text-white shadow-sm"
              : "hover:bg-background bg-transparent text-(--color-text-secondary) hover:text-(--color-primary-dark)"
          }`}
        >
          <Icon name="table-columns" className="w-4 text-center" />
          <span className="flex-1 text-left">Theo tuần</span>
        </button>
        <button
          type="button"
          onClick={() => setView("month")}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-none px-3 py-2.5 text-sm font-medium transition-all ${
            view === "month"
              ? "bg-(--color-primary) text-white shadow-sm"
              : "hover:bg-background bg-transparent text-(--color-text-secondary) hover:text-(--color-primary-dark)"
          }`}
        >
          <Icon name="calendar" className="w-4 text-center" />
          <span className="flex-1 text-left">Theo tháng</span>
        </button>

        <div className="mt-3 border-t border-(--color-border-light) pt-3">
          <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
            Điều hướng
          </p>
          <button
            type="button"
            onClick={goToToday}
            className="hover:bg-background flex w-full cursor-pointer items-center gap-3 rounded-xl border-none bg-transparent px-3 py-2.5 text-sm font-medium text-(--color-text-secondary) transition-all hover:text-(--color-primary-dark)"
          >
            <Icon name="crosshairs" className="w-4 text-center" />
            <span className="flex-1 text-left">Hôm nay</span>
          </button>
        </div>

        {isManager && (
          <div className="mt-3 border-t border-(--color-border-light) pt-3">
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
              Quản lý
            </p>
            <Link
              href="/manager"
              className="hover:bg-background flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-(--color-text-secondary) no-underline transition-all hover:text-(--color-primary-dark)"
            >
              <Icon name="store" className="w-4 text-center" />
              <span className="flex-1 text-left">Dashboard</span>
            </Link>
          </div>
        )}

        {/* UC-24: labour cost of the visible week (BR-52) */}
        {isManager && weeklyLaborCost !== null && (
          <div className="mt-3 border-t border-(--color-border-light) pt-3">
            <div className="rounded-xl bg-(--color-primary)/5 p-3">
              <p className="text-[10px] font-semibold text-(--color-text-muted) uppercase">
                Chi phí nhân công tuần
              </p>
              <p className="mt-1 text-lg font-bold text-(--color-primary)">
                {formatVND(weeklyLaborCost)}
              </p>
              <p className="text-[10px] text-(--color-text-muted)">
                Trước khi chấm công là chi phí dự kiến
              </p>
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-(--color-border-light) p-3">
        <div className="flex items-center gap-3 rounded-xl p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-accent-light)">
            <Icon
              name={isManager ? "user-tie" : "user"}
              className="text-sm text-(--color-primary)"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-semibold">
              {user?.fullName ?? "Nhân viên"}
            </p>
            <p className="text-xs text-(--color-text-muted)">
              {isManager ? "Quản lý" : "Nhân viên"}
            </p>
          </div>
        </div>
        <div className="mt-1 flex gap-2 px-1">
          <Link
            href="/staff/orders"
            className="hover:bg-background flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-(--color-border-light) bg-transparent py-2 text-xs font-medium text-(--color-text-secondary) no-underline transition"
          >
            <Icon name="receipt" />
            Đơn hàng
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-transparent py-2 text-xs font-medium text-(--color-danger) transition hover:bg-(--color-danger-bg)"
          >
            <Icon name="right-from-bracket" />
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}
