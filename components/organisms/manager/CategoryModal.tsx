"use client";

import type { MenuCategory } from "@/lib/types";
import { useState } from "react";

import type { CategoryModalProps } from "./Manager.types";

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

export default function CategoryModal({
  category,
  onSave,
  onClose,
}: CategoryModalProps) {
  const isEdit = category !== null;
  const [form, setForm] = useState<Omit<MenuCategory, "id">>({
    name: category?.name ?? "",
    icon: category?.icon ?? FA_ICONS[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && category) {
      onSave({ ...form, id: category.id });
    } else {
      onSave(form);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-(--color-border-light) px-6 py-4">
          <h2 className="text-foreground text-lg font-bold">
            {isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </h2>
          <button
            title="Close"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-(--color-text-muted) transition-colors hover:bg-(--color-border-light) hover:text-(--color-primary)"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-(--color-text-secondary)">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="text-foreground w-full rounded-xl border border-(--color-border) bg-white px-3 py-2 text-sm transition outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20"
              placeholder="Ví dụ: Cà Phê"
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
                  <i className={`${icon} text-sm`}></i>
                </button>
              ))}
            </div>
          </div>

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
              className="flex-1 cursor-pointer rounded-xl border-none bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--color-primary-dark) active:scale-95"
            >
              {isEdit ? "Lưu thay đổi" : "Thêm danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
