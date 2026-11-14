"use client";

import { Modal } from "@/components/molecules/modal";
import { errorMessage } from "@/lib/utils/errors";
import { useState } from "react";

import type { DeleteConfirmProps } from "./Manager.types";

export default function DeleteConfirm({
  name,
  note,
  onConfirm,
  onClose,
}: DeleteConfirmProps) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      labelledBy="delete-confirm-title"
      className="max-w-sm p-6"
    >
      <div className="mb-4 flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <i className="fa-solid fa-trash-can text-xl text-red-500"></i>
        </div>
        <h3
          id="delete-confirm-title"
          className="text-foreground text-base font-bold"
        >
          Xóa &ldquo;{name}&rdquo;?
        </h3>
        <p className="text-sm text-(--color-text-muted)">
          {note ?? "Hành động này không thể hoàn tác."}
        </p>
      </div>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 cursor-pointer rounded-xl border border-(--color-border) bg-white px-4 py-2.5 text-sm font-medium text-(--color-text-secondary) transition hover:bg-(--color-border-light)"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={busy || !!error}
          className="flex-1 cursor-pointer rounded-xl border-none bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-95 disabled:opacity-50"
        >
          Xóa
        </button>
      </div>
    </Modal>
  );
}
