"use client";

import { Alert } from "@/components/atoms";
import { Modal, ModalHeader } from "@/components/molecules/modal";
import type { ProductInput } from "@/lib/types";
import { rangeLabel } from "@/lib/utils/options";
import { useState } from "react";

import type { ProductModalProps } from "./Manager.types";
import { inputCls, labelCls, useSaveForm } from "./useSaveForm";

const PLACEHOLDER_IMAGE = "/imgs/products/placeholder.jpg";

/**
 * Add or edit a product: name, category, price, cost price, image,
 * description and sale status. Shows the margin as the prices are typed and
 * warns when the cost price is missing (BR-10).
 * @param props.product The product to edit, or null to add one.
 * @param props.categories Categories to choose from.
 * @param props.optionGroups Option groups that can be attached, in the order
 *   they are ticked (C-6, C-7).
 * @param props.onSave Saves the form; resolves once the server accepted it.
 * @param props.onClose Closes the modal.
 */
export default function ProductModal({
  product,
  categories,
  optionGroups,
  onSave,
  onClose,
}: ProductModalProps) {
  const isEdit = product !== null;
  const [form, setForm] = useState<ProductInput>({
    name: product?.name ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? 0,
    description: product?.description ?? "",
    price: product?.price ?? 0,
    costPrice: product?.costPrice ?? 0,
    imageUrl: product?.imageUrl ?? PLACEHOLDER_IMAGE,
    isAvailable: product?.isAvailable ?? true,
    optionGroupIds: product?.optionGroupIds ?? [],
  });

  // The tick order is the order customers see the groups in (C-6, C-7)
  const toggleGroup = (id: number) =>
    setForm((f) => ({
      ...f,
      optionGroupIds: f.optionGroupIds.includes(id)
        ? f.optionGroupIds.filter((x) => x !== id)
        : [...f.optionGroupIds, id],
    }));
  const { submit, error, saving } = useSaveForm(onSave, onClose);

  const margin =
    form.price > 0 && form.costPrice > 0
      ? Math.round(((form.price - form.costPrice) / form.price) * 100)
      : null;

  return (
    <Modal onClose={onClose} className="flex max-h-[92vh] max-w-lg flex-col">
      <ModalHeader
        title={isEdit ? "Chỉnh sửa món" : "Thêm món mới"}
        onClose={onClose}
      />

      <form
        onSubmit={submit(() => ({ ...form, name: form.name.trim() }))}
        className="space-y-4 overflow-y-auto px-6 py-5"
      >
        <div>
          <label htmlFor="product-name" className={labelCls}>
            Tên món <span className="text-red-500">*</span>
          </label>
          <input
            id="product-name"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
            placeholder="Ví dụ: Cà Phê Đen"
          />
        </div>

        <div>
          <label htmlFor="product-category" className={labelCls}>
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            id="product-category"
            required
            value={form.categoryId}
            onChange={(e) =>
              setForm({ ...form, categoryId: Number(e.target.value) })
            }
            className={inputCls}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="product-price" className={labelCls}>
              Giá bán (đ) <span className="text-red-500">*</span>
            </label>
            <input
              id="product-price"
              required
              type="number"
              min={1000}
              step={1000}
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="product-cost" className={labelCls}>
              Giá vốn (đ)
            </label>
            <input
              id="product-cost"
              type="number"
              min={0}
              step={500}
              value={form.costPrice}
              onChange={(e) =>
                setForm({ ...form, costPrice: Number(e.target.value) })
              }
              className={inputCls}
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-(--color-text-muted)">
          {form.costPrice === 0
            ? "Chưa khai báo giá vốn: báo cáo lợi nhuận sẽ đánh dấu món này (BR-10)."
            : `Biên lợi nhuận khoảng ${margin}%.`}{" "}
          Mỗi lần đổi giá đều được ghi lại (BR-15).
        </p>

        <div>
          <label htmlFor="product-image" className={labelCls}>
            Ảnh (URL)
          </label>
          <input
            id="product-image"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="product-description" className={labelCls}>
            Mô tả
          </label>
          <textarea
            id="product-description"
            rows={3}
            maxLength={500}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`${inputCls} resize-none`}
            placeholder="Mô tả ngắn về món..."
          />
        </div>

        <fieldset>
          <legend className={labelCls}>Nhóm tuỳ chọn</legend>
          {optionGroups.length === 0 ? (
            <p className="text-xs text-(--color-text-muted)">
              Chưa có nhóm nào. Tạo nhóm ở tab Tuỳ chọn.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {optionGroups.map((g) => {
                const pos = form.optionGroupIds.indexOf(g.id);
                return (
                  <label
                    key={g.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-sm ${pos >= 0 ? "border-(--color-primary) bg-(--color-primary)/5" : "border-(--color-border-light)"}`}
                  >
                    <input
                      type="checkbox"
                      checked={pos >= 0}
                      onChange={() => toggleGroup(g.id)}
                      className="accent-(--color-primary)"
                    />
                    {pos >= 0 && (
                      <span className="text-xs font-bold text-(--color-primary)">
                        {pos + 1}.
                      </span>
                    )}
                    {g.name}
                    <span className="text-xs text-(--color-text-muted)">
                      {g.minSelect > 0 ? "bắt buộc, " : ""}
                      {rangeLabel(g).toLowerCase()}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>

        <label className="bg-background flex cursor-pointer items-center justify-between rounded-xl border border-(--color-border-light) px-4 py-3">
          <span>
            <span className="text-foreground block text-sm font-medium">
              Đang bán
            </span>
            <span className="text-xs text-(--color-text-muted)">
              Tắt khi hết nguyên liệu, món sẽ ẩn khỏi menu
            </span>
          </span>
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(e) =>
              setForm({ ...form, isAvailable: e.target.checked })
            }
            className="h-5 w-5 accent-(--color-primary)"
          />
        </label>

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
            {isEdit ? "Lưu thay đổi" : "Thêm món"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
