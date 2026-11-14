"use client";

import { RoleGuard } from "@/components/templates/role-guard";
import { orderService } from "@/lib/services";
import type { Order } from "@/lib/types";
import { formatVND } from "@/lib/utils/currency";
import { errorMessage } from "@/lib/utils/errors";
import { ORDER_STATUS, formatDateTime } from "@/lib/utils/order";
import Link from "next/link";
import { useEffect, useState } from "react";

/** UC-09: lịch sử đơn của khách có tài khoản (O-3) */
function OrderHistory() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    orderService
      .listMine()
      .then(setOrders, (err) => setError(errorMessage(err)));
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
      <h1 className="text-foreground mb-4 text-2xl font-bold">Đơn của tôi</h1>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {!orders && !error && (
        <i className="fa-solid fa-spinner fa-spin text-2xl text-(--color-primary)"></i>
      )}
      {orders?.length === 0 && (
        <p className="text-(--color-text-muted)">
          Bạn chưa có đơn nào.{" "}
          <Link href="/" className="text-(--color-primary) hover:underline">
            Xem menu
          </Link>
        </p>
      )}
      <ul className="space-y-3">
        {orders?.map((o) => {
          const s = ORDER_STATUS[o.status];
          return (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="bg-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--color-border-light) px-4 py-3 no-underline hover:border-(--color-primary)"
              >
                <div>
                  <p className="text-foreground font-semibold">{o.code}</p>
                  <p className="text-xs text-(--color-text-muted)">
                    {formatDateTime(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {o.status === "COMPLETED" && !o.review && (
                    <span className="text-xs font-semibold text-(--color-accent)">
                      Chưa đánh giá
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}
                  >
                    {s.label}
                  </span>
                  <span className="font-bold text-(--color-primary)">
                    {formatVND(o.total)}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RoleGuard allow={["CUSTOMER"]}>
      <OrderHistory />
    </RoleGuard>
  );
}
