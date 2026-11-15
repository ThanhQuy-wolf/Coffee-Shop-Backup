"use client";

import { Alert, Icon } from "@/components/atoms";
import { Modal } from "@/components/molecules/modal";
import { errorMessage } from "@/lib/utils/errors";
import { useState } from "react";

import type { DeleteConfirmProps } from "./Manager.types";

/**
 * Confirmation dialog for deleting a category, product or combo. Closes on
 * success and shows the server error otherwise.
 * @param props.name Name of the item, shown in the question.
 * @param props.note What happens to the data, e.g. soft delete (BR-14).
 * @param props.onConfirm Performs the delete.
 * @param props.onClose Closes the dialog.
 */
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
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-danger-bg)">
          <Icon name="trash-can" className="text-xl text-(--color-danger)" />
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
      <Alert message={error} className="mb-4" />
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
          className="flex-1 cursor-pointer rounded-xl border-none bg-(--color-danger) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--color-danger)/90 active:scale-95 disabled:opacity-50"
        >
          Xóa
        </button>
      </div>
    </Modal>
  );
}
