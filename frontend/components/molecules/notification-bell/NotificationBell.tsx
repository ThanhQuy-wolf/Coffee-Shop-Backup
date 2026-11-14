"use client";

import { notificationService } from "@/lib/services";
import type { AppNotification } from "@/lib/types";
import { useEffect, useState } from "react";

/**
 * Bell with the count of unread notifications and a dropdown to read them.
 * Loads once on mount (A-8); "Đã đọc" removes an item right away and tells
 * the server in the background (A-9). Shift changes reach staff here on
 * their next visit (BR-42).
 */
export default function NotificationBell() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    notificationService
      .list()
      .then((list) => !cancelled && setItems(list))
      .catch(() => {
        // A missing bell is not worth an error banner
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markRead = (id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    void notificationService.markRead(id);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Thông báo (${items.length} chưa đọc)`}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-(--color-border) bg-transparent text-(--color-text-secondary) transition hover:bg-(--color-border-light)"
      >
        <i className="fa-solid fa-bell"></i>
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-60 mt-2 w-72 rounded-xl border border-(--color-border-light) bg-white p-2 shadow-xl">
          {items.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-(--color-text-muted)">
              Không có thông báo mới
            </p>
          ) : (
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {items.map((n) => (
                <li
                  key={n.id}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <p className="text-foreground">{n.message}</p>
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="mt-1 cursor-pointer border-none bg-transparent p-0 text-xs text-(--color-primary) hover:underline"
                  >
                    Đã đọc
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
