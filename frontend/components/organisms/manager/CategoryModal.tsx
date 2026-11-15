"use client";

import { Alert, Icon } from "@/components/atoms";
import { Modal, ModalHeader } from "@/components/molecules/modal";
import type { CategoryInput } from "@/lib/types";
import { useState } from "react";

import type { CategoryModalProps } from "./Manager.types";
import { inputCls, labelCls, useSaveForm } from "./useSaveForm";

/** Icons the manager can pick for a category. */
const FA_ICONS = [
  "fa-solid fa-mug-hot",
  "fa-solid fa-leaf",
  "fa-solid fa-jar",
  "fa-solid fa-blender",
  "fa-solid fa-mug-saucer",
  "fa-solid fa-ice-cream",
  "fa-solid fa-layer-group",
  "fa-solid fa-burger",
  "fa-solid fa-pizza-slice",
  "fa-solid fa-bowl-food",
  "fa-solid fa-candy-cane",
  "fa-solid fa-cookie",
  "fa-solid fa-cake-candles",
  "fa-solid fa-drumstick-bite",
  "fa-solid fa-fish",
  "fa-solid fa-carrot",
];

/**
 * Add or edit a category: name, icon and sort order. Stays open and shows the
 * server error if saving fails.
 * @param props.category The category to edit, or null to add one.
 * @param props.nextSortOrder Default sort order for a new category.
 * @param props.onSave Saves the form; resolves once the server accepted it.
 * @param props.onClose Closes the modal.
 */
export default function CategoryModal({
  category,
  nextSortOrder,
  onSave,
  onClose,
}: CategoryModalProps) {
  const isEdit = category !== null;
  const [form, setForm] = useState<CategoryInput>({
    name: category?.name ?? "",
    icon: category?.icon ?? FA_ICONS[0],
    sortOrder: category?.sortOrder ?? nextSortOrder,
  });
  const { submit, error, saving } = useSaveForm(onSave, onClose);

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        title={isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        onClose={onClose}
      />

      <form
        onSubmit={submit(() => ({ ...form, name: form.name.trim() }))}
        className="space-y-4 px-6 py-5"
      >
        <div>
          <label htmlFor="category-name" className={labelCls}>
            Tên danh mục <span className="text-(--color-danger)">*</span>
          </label>
          <input
            id="category-name"
            required
            maxLength={50}
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
            placeholder="Ví dụ: Cà Phê"
          />
        </div>

        <div>
          <label htmlFor="category-order" className={labelCls}>
            Thứ tự hiển thị
          </label>
          <input
            id="category-order"
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) =>
              setForm({ ...form, sortOrder: Number(e.target.value) })
            }
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-(--color-text-secondary)">
            Icon
          </label>
          <div className="grid grid-cols-8 gap-2">
            {FA_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setForm({ ...form, icon })}
                title={icon}
                className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition ${
                  form.icon === icon
                    ? "border-(--color-primary) bg-(--color-primary) text-white"
                    : "bg-background border-(--color-border-light) text-(--color-text-secondary) hover:border-(--color-primary-light) hover:text-(--color-primary)"
                }`}
              >
                <Icon name={icon} className="text-sm" />
              </button>
            ))}
          </div>
        </div>

        <Alert message={error} />

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-(--color-border) bg-white px-4 py-2.5 text-sm font-medium text-(--color-text-secondary) transition hover:bg-(--color-border-light)"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 cursor-pointer rounded-xl border-none bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--color-primary-dark) active:scale-95 disabled:opacity-50"
          >
            {isEdit ? "Lưu thay đổi" : "Thêm danh mục"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
