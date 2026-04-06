"use client";

import type { Combo, Product } from "@/lib/types";
import { useState } from "react";

import type { ComboModalProps } from "./Manager.types";

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function ComboModal({
  combo,
  products,
  onSave,
  onClose,
}: ComboModalProps) {
  const isEdit = combo !== null;
  const [form, setForm] = useState<Omit<Combo, "id">>({
    name: combo?.name ?? "",
    description: combo?.description ?? "",
    price: combo?.price ?? 0,
    image: combo?.image ?? "/imgs/products/placeholder.jpg",
    items: combo?.items ?? [],
    available: combo?.available ?? true,
  });

  const updateItemQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      setForm((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.productId !== productId),
      }));
    } else {
      setForm((prev) => {
        const existing = prev.items.find((i) => i.productId === productId);
        if (existing) {
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.productId === productId ? { ...i, quantity: qty } : i,
            ),
          };
        }
        return {
          ...prev,
          items: [...prev.items, { productId, quantity: qty }],
        };
      });
    }
  };

  const getQty = (productId: number) =>
    form.items.find((i) => i.productId === productId)?.quantity ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.items.length === 0) return;
    if (isEdit && combo) {
      onSave({ ...form, id: combo.id });
    } else {
      onSave(form);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-(--color-border) bg-white px-3 py-2 text-sm transition outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-(--color-border-light) px-6 py-4">
          <h2 className="text-foreground text-lg font-bold">
            {isEdit ? "Chỉnh sửa combo" : "Thêm combo mới"}
          </h2>
          <button
            title="Close"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-(--color-text-muted) transition-colors hover:bg-(--color-border-light) hover:text-(--color-primary)"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-(--color-text-secondary)">
                Tên combo <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
                placeholder="Ví dụ: Combo Cà Phê Đôi"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-(--color-text-secondary)">
                Giá combo (đ) <span className="text-red-500">*</span>
              </label>
              <input
                title="Giá combo"
                required
                type="number"
                min={0}
                step={1000}
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-(--color-text-secondary)">
                Mô tả
              </label>
              <textarea
                title="Mô tả combo"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className={`${inputCls} resize-none`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-(--color-text-secondary)">
                Món trong combo{" "}
                {form.items.length === 0 && (
                  <span className="text-xs text-red-500">
                    (Chọn ít nhất 1 món)
                  </span>
                )}
              </label>
              <div className="bg-background max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-(--color-border-light) p-2">
                {products.map((p) => {
                  const qty = getQty(p.id);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                    >
                      <span className="text-foreground flex-1 truncate">
                        {p.name}
                      </span>
                      <span className="mr-3 text-xs text-(--color-text-muted)">
                        {formatPrice(p.price)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          title="Giảm"
                          type="button"
                          onClick={() => updateItemQty(p.id, qty - 1)}
                          disabled={qty === 0}
                          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-(--color-border) bg-white text-xs text-(--color-text-secondary) transition hover:border-(--color-primary) hover:text-(--color-primary) disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <span className="text-foreground w-5 text-center text-sm font-semibold">
                          {qty}
                        </span>
                        <button
                          title="Tăng"
                          type="button"
                          onClick={() => updateItemQty(p.id, qty + 1)}
                          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-(--color-border) bg-white text-xs text-(--color-text-secondary) transition hover:border-(--color-primary) hover:text-(--color-primary)"
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-background flex items-center justify-between rounded-xl border border-(--color-border-light) px-4 py-3">
              <div>
                <p className="text-foreground text-sm font-medium">
                  Trạng thái
                </p>
                <p className="text-xs text-(--color-text-muted)">
                  {form.available ? "Còn hàng" : "Tạm hết"}
                </p>
              </div>
              <button
                title="Chuyển đổi trạng thái"
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
          </div>

          <div className="flex gap-3 border-t border-(--color-border-light) px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl border border-(--color-border) bg-white px-4 py-2.5 text-sm font-medium text-(--color-text-secondary) transition hover:bg-(--color-border-light)"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={form.items.length === 0}
              className="flex-1 cursor-pointer rounded-xl border-none bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--color-primary-dark) active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEdit ? "Lưu thay đổi" : "Thêm combo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
