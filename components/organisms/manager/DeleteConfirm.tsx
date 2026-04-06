"use client";

import type { DeleteConfirmProps } from "./Manager.types";

export default function DeleteConfirm({
  name,
  onConfirm,
  onClose,
}: DeleteConfirmProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <i className="fa-solid fa-trash-can text-xl text-red-500"></i>
          </div>
          <h3 className="text-foreground text-base font-bold">Xóa "{name}"?</h3>
          <p className="text-sm text-(--color-text-muted)">
            Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-(--color-border) bg-white px-4 py-2.5 text-sm font-medium text-(--color-text-secondary) transition hover:bg-(--color-border-light)"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-xl border-none bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-95"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
