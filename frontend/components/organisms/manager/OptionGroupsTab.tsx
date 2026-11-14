"use client";

import { Alert } from "@/components/atoms";
import { useManager } from "@/lib/contexts/manager-context";
import type { OptionGroup } from "@/lib/types";
import { formatVND } from "@/lib/utils/currency";
import { errorMessage } from "@/lib/utils/errors";
import { rangeLabel } from "@/lib/utils/options";
import { useState } from "react";

import DeleteConfirm from "./DeleteConfirm";
import OptionGroupModal from "./OptionGroupModal";

/**
 * Manager tab for option groups (UC-25, C-15 → C-19): lists groups with their
 * values, toggles a value on or off sale, and opens the add, edit and delete
 * dialogs.
 */
export default function OptionGroupsTab() {
  const {
    optionGroups,
    saveOptionGroup,
    deleteOptionGroup,
    setOptionValueAvailability,
  } = useManager();

  const [modalGroup, setModalGroup] = useState<OptionGroup | null | "new">(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<OptionGroup | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const nextSortOrder =
    Math.max(0, ...optionGroups.map((g) => g.sortOrder)) + 1;

  const toggle = async (valueId: number, isAvailable: boolean) => {
    setToggleError(null);
    try {
      await setOptionValueAvailability(valueId, isAvailable);
    } catch (err) {
      setToggleError(errorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-(--color-text-muted)">
          <strong className="text-foreground">{optionGroups.length}</strong>{" "}
          nhóm, dùng chung cho nhiều món. Gắn nhóm vào món ở tab Thực đơn.
        </p>
        <button
          onClick={() => setModalGroup("new")}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border-none bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white transition hover:bg-(--color-primary-dark) active:scale-95"
        >
          <i className="fa-solid fa-plus"></i>
          <span className="hidden sm:inline">Thêm nhóm</span>
        </button>
      </div>

      <Alert message={toggleError} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {optionGroups.map((g) => (
          <section
            key={g.id}
            className="rounded-2xl border border-(--color-border-light) bg-white p-4 shadow-sm"
          >
            <header className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-foreground font-semibold">{g.name}</h3>
                <p className="text-xs text-(--color-text-muted)">
                  {g.selectionType === "SINGLE" ? "Chọn một" : "Chọn nhiều"} ·{" "}
                  {g.minSelect > 0 ? "bắt buộc" : "không bắt buộc"} ·{" "}
                  {rangeLabel(g).toLowerCase()} · {g.productCount ?? 0} món
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => setModalGroup(g)}
                  title="Chỉnh sửa"
                  aria-label={`Sửa nhóm ${g.name}`}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-(--color-border-light) bg-transparent text-(--color-text-muted) transition hover:border-(--color-primary-light) hover:text-(--color-primary)"
                >
                  <i className="fa-solid fa-pen text-xs"></i>
                </button>
                <button
                  onClick={() => setDeleteTarget(g)}
                  title="Xóa"
                  aria-label={`Xoá nhóm ${g.name}`}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-transparent text-(--color-text-muted) transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                >
                  <i className="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
            </header>

            <ul className="divide-y divide-(--color-border-light) text-sm">
              {g.values.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <span
                    className={
                      v.isAvailable
                        ? "text-foreground"
                        : "text-(--color-text-muted) line-through"
                    }
                  >
                    {v.name}
                    {v.isDefault && (
                      <span className="ml-2 rounded bg-(--color-accent-light) px-1.5 py-0.5 text-[10px] font-semibold text-(--color-primary-dark)">
                        Mặc định
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-xs text-(--color-text-secondary)">
                      {v.priceDelta > 0 ? `+${formatVND(v.priceDelta)}` : "—"}
                    </span>
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-(--color-text-muted)">
                      <input
                        type="checkbox"
                        checked={v.isAvailable}
                        onChange={(e) => toggle(v.id, e.target.checked)}
                        className="h-4 w-4 accent-(--color-primary)"
                        aria-label={`Đang bán ${v.name}`}
                      />
                      Bán
                    </label>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {optionGroups.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 py-16 text-(--color-text-muted)">
            <i className="fa-solid fa-sliders text-4xl opacity-30"></i>
            <p className="text-sm">Chưa có nhóm tuỳ chọn nào</p>
          </div>
        )}
      </div>

      {modalGroup !== null && (
        <OptionGroupModal
          group={modalGroup === "new" ? null : modalGroup}
          nextSortOrder={nextSortOrder}
          onSave={(input) =>
            saveOptionGroup(
              input,
              modalGroup === "new" ? undefined : modalGroup.id,
            )
          }
          onClose={() => setModalGroup(null)}
        />
      )}

      {deleteTarget !== null && (
        <DeleteConfirm
          name={deleteTarget.name}
          note="Phải gỡ nhóm khỏi mọi món trước. Nhóm đã từng bán chỉ bị ẩn, đơn cũ giữ nguyên tuỳ chọn đã chọn (BR-19)."
          onConfirm={() => deleteOptionGroup(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
