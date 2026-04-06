"use client";

import { useManager } from "@/lib/manager-context";
import type { Combo } from "@/lib/types";
import { useState } from "react";

import ComboModal from "./ComboModal";
import DeleteConfirm from "./DeleteConfirm";
import StatusBadge from "./StatusBadge";

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function CombosTab() {
  const {
    combos,
    products,
    addCombo,
    updateCombo,
    deleteCombo,
    toggleComboAvailability,
  } = useManager();

  const [modalCombo, setModalCombo] = useState<Combo | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Combo | null>(null);

  const getProductName = (id: number) =>
    products.find((p) => p.id === id)?.name ?? `Món #${id}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-(--color-text-muted)">
          <strong className="text-foreground">{combos.length}</strong> combo
        </p>
        <button
          onClick={() => setModalCombo("new")}
          className="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white transition hover:bg-(--color-primary-dark) active:scale-95"
        >
          <i className="fa-solid fa-plus"></i>
          <span className="hidden sm:inline">Thêm combo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {combos.length === 0 ? (
          <div className="col-span-full flex flex-col items-center gap-3 py-16 text-(--color-text-muted)">
            <i className="fa-solid fa-layer-group text-4xl opacity-30"></i>
            <p className="text-sm">Chưa có combo nào</p>
          </div>
        ) : (
          combos.map((combo) => (
            <div
              key={combo.id}
              className="flex flex-col rounded-2xl border border-(--color-border-light) bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground truncate font-semibold">
                    {combo.name}
                  </h3>
                  {combo.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-(--color-text-muted)">
                      {combo.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleComboAvailability(combo.id)}
                  className="ml-3 shrink-0 cursor-pointer border-none bg-transparent"
                  title="Đổi trạng thái"
                >
                  <StatusBadge available={combo.available} />
                </button>
              </div>

              <div className="bg-background mx-4 mb-3 rounded-xl px-3 py-2">
                <p className="mb-1 text-[11px] font-semibold tracking-wide text-(--color-text-muted) uppercase">
                  Bao gồm
                </p>
                <ul className="space-y-0.5">
                  {combo.items.map((item) => (
                    <li
                      key={item.productId}
                      className="flex items-center justify-between text-xs text-(--color-text-secondary)"
                    >
                      <span>{getProductName(item.productId)}</span>
                      <span className="font-medium">×{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between border-t border-(--color-border-light) px-4 py-3">
                <span className="text-base font-bold text-(--color-primary)">
                  {formatPrice(combo.price)}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setModalCombo(combo)}
                    title="Chỉnh sửa"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-(--color-border-light) bg-transparent text-(--color-text-muted) transition hover:border-(--color-primary-light) hover:text-(--color-primary)"
                  >
                    <i className="fa-solid fa-pen text-xs"></i>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(combo)}
                    title="Xóa"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-transparent text-(--color-text-muted) transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                  >
                    <i className="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalCombo !== null && (
        <ComboModal
          combo={modalCombo === "new" ? null : modalCombo}
          products={products}
          onSave={(data) => {
            if ("id" in data) {
              updateCombo(data as Combo);
            } else {
              addCombo(data);
            }
            setModalCombo(null);
          }}
          onClose={() => setModalCombo(null)}
        />
      )}

      {deleteTarget !== null && (
        <DeleteConfirm
          name={deleteTarget.name}
          onConfirm={() => {
            deleteCombo(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
