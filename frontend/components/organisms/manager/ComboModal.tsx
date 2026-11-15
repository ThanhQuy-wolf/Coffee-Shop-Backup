"use client";

import { Alert, Icon } from "@/components/atoms";
import { Modal, ModalHeader } from "@/components/molecules/modal";
import type { ComboInput } from "@/lib/types";
import { formatVND } from "@/lib/utils/currency";
import { useState } from "react";

import type { ComboModalProps } from "./Manager.types";
import { inputCls, useSaveForm } from "./useSaveForm";

/**
 * Add or edit a combo: name, price, image and the products it contains with
 * their quantities. A combo needs at least 2 units in total (BR-13).
 * @param props.combo The combo to edit, or null to add one.
 * @param props.products Products that can go into the combo.
 * @param props.onSave Saves the form; resolves once the server accepted it.
 * @param props.onClose Closes the modal.
 */
export default function ComboModal({
  combo,
  products,
  onSave,
  onClose,
}: ComboModalProps) {
  const isEdit = combo !== null;
  const [form, setForm] = useState<ComboInput>({
    name: combo?.name ?? "",
    description: combo?.description ?? "",
    price: combo?.price ?? 0,
    imageUrl: combo?.imageUrl ?? "/imgs/products/placeholder.jpg",
    items: combo?.items ?? [],
    isAvailable: combo?.isAvailable ?? true,
  });
  const { submit, error, saving } = useSaveForm(onSave, onClose);

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

  // BR-13: at least 2 units in total
  const totalQty = form.items.reduce((s, i) => s + i.quantity, 0);
  const partsTotal = form.items.reduce(
    (s, i) =>
      s + (products.find((p) => p.id === i.productId)?.price ?? 0) * i.quantity,
    0,
  );

  return (
    <Modal onClose={onClose} className="flex max-h-[90vh] max-w-xl flex-col">
      <ModalHeader
        title={isEdit ? "Chỉnh sửa combo" : "Thêm combo mới"}
        onClose={onClose}
      />

      <form
        onSubmit={submit(() => ({ ...form, name: form.name.trim() }))}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-(--color-text-secondary)">
              Tên combo <span className="text-(--color-danger)">*</span>
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
              Giá combo (đ) <span className="text-(--color-danger)">*</span>
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
              {totalQty < 2 && (
                <span className="text-xs text-(--color-danger)">
                  (ít nhất 2 phần, BR-13)
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
                      {formatVND(p.price)}
                      {!p.isAvailable && " · tạm ngừng"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        title="Giảm"
                        aria-label="Giảm"
                        type="button"
                        onClick={() => updateItemQty(p.id, qty - 1)}
                        disabled={qty === 0}
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-(--color-border) bg-white text-xs text-(--color-text-secondary) transition hover:border-(--color-primary) hover:text-(--color-primary) disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Icon name="minus" />
                      </button>
                      <span className="text-foreground w-5 text-center text-sm font-semibold">
                        {qty}
                      </span>
                      <button
                        title="Tăng"
                        aria-label="Tăng"
                        type="button"
                        onClick={() => updateItemQty(p.id, qty + 1)}
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-(--color-border) bg-white text-xs text-(--color-text-secondary) transition hover:border-(--color-primary) hover:text-(--color-primary)"
                      >
                        <Icon name="plus" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-background flex items-center justify-between rounded-xl border border-(--color-border-light) px-4 py-3">
            <div>
              <p className="text-foreground text-sm font-medium">Đang bán</p>
              <p className="text-xs text-(--color-text-muted)">
                Combo tự ẩn khi một món thành phần ngừng bán
              </p>
            </div>
            <button
              title="Chuyển đổi trạng thái"
              aria-label="Chuyển đổi trạng thái"
              type="button"
              aria-pressed={form.isAvailable}
              onClick={() =>
                setForm({ ...form, isAvailable: !form.isAvailable })
              }
              className={`relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors duration-200 ${
                form.isAvailable ? "bg-(--color-primary)" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  form.isAvailable ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {partsTotal > 0 && (
          <p className="px-6 pb-2 text-xs text-(--color-text-muted)">
            Mua lẻ: {formatVND(partsTotal)}
            {form.price > 0 &&
              form.price < partsTotal &&
              ` · khách tiết kiệm ${formatVND(partsTotal - form.price)}`}
          </p>
        )}
        <Alert message={error} className="mx-6 mb-2" />
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
            disabled={totalQty < 2 || saving}
            className="flex-1 cursor-pointer rounded-xl border-none bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--color-primary-dark) active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEdit ? "Lưu thay đổi" : "Thêm combo"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
