"use client";

import type { Product } from "@/lib/types";
import { useState } from "react";

import type { ProductModalProps } from "./Manager.types";

export default function ProductModal({
  product,
  categories,
  onSave,
  onClose,
}: ProductModalProps) {
  const isEdit = product !== null;
  const [form, setForm] = useState<Omit<Product, "id">>({
    name: product?.name ?? "",
    category: product?.category ?? categories[0]?.id ?? "",
    price: product?.price ?? 0,
    image: product?.image ?? "/imgs/products/placeholder.jpg",
    description: product?.description ?? "",
    available: product?.available ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && product) {
      onSave({ ...form, id: product.id });
    } else {
      onSave(form);
    }
  };

  const inputCls =
    "text-foreground w-full rounded-xl border border-(--color-border) bg-white px-3 py-2 text-sm transition outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-(--color-border-light) px-6 py-4">
          <h2 className="text-foreground text-lg font-bold">
            {isEdit ? "Chỉnh sửa món" : "Thêm món mới"}
          </h2>
          <button
            onClick={onClose}
            title="Đóng"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-(--color-text-muted) transition-colors hover:bg-(--color-border-light) hover:text-(--color-primary)"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-(--color-text-secondary)">
              Tên món <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
              placeholder="Ví dụ: Cà Phê Đen"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-(--color-text-secondary)">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                required
                title="Chọn danh mục"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputCls}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-(--color-text-secondary)">
                Giá (đ) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min={0}
                step={1000}
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className={inputCls}
                placeholder="25000"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-(--color-text-secondary)">
              Mô tả
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={`${inputCls} resize-none`}
              placeholder="Mô tả ngắn về món..."
            />
          </div>

          <div className="bg-background flex items-center justify-between rounded-xl border border-(--color-border-light) px-4 py-3">
            <div>
              <p className="text-foreground text-sm font-medium">Trạng thái</p>
              <p className="text-xs text-(--color-text-muted)">
                {form.available ? "Còn hàng" : "Tạm hết"}
              </p>
            </div>
            <button
              title="Chuyển trạng thái"
              type="button"
              onClick={() => setForm({ ...form, available: !form.available })}
              className={`relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors duration-200 ${
                form.available ? "bg-(--color-primary)" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  form.available ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
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
              {isEdit ? "Lưu thay đổi" : "Thêm món"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
