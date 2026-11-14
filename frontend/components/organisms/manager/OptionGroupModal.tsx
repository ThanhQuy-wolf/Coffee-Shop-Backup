"use client";

import { Alert } from "@/components/atoms";
import { Modal, ModalHeader } from "@/components/molecules/modal";
import type { OptionGroupInput, OptionSelectionType } from "@/lib/types";
import { useState } from "react";

import type { OptionGroupModalProps } from "./Manager.types";
import { inputCls, labelCls, useSaveForm } from "./useSaveForm";

type ValueDraft = OptionGroupInput["values"][number];

const emptyValue = (): ValueDraft => ({
  name: "",
  priceDelta: 0,
  costDelta: 0,
  isDefault: false,
  sortOrder: 0,
});

/**
 * Add or edit an option group and its values (UC-25). The server enforces
 * BR-16 and BR-17; the form only keeps the shape consistent, e.g. one
 * default in a single-choice group.
 * @param props.group The group to edit, or null to add one.
 * @param props.nextSortOrder Display order for a new group.
 * @param props.onSave Saves the form; resolves once the server accepted it.
 * @param props.onClose Closes the modal.
 */
export default function OptionGroupModal({
  group,
  nextSortOrder,
  onSave,
  onClose,
}: OptionGroupModalProps) {
  const isEdit = group !== null;
  const [form, setForm] = useState<OptionGroupInput>({
    name: group?.name ?? "",
    selectionType: group?.selectionType ?? "SINGLE",
    minSelect: group?.minSelect ?? 1,
    maxSelect: group?.maxSelect ?? 1,
    sortOrder: group?.sortOrder ?? nextSortOrder,
    values: group?.values.map(
      ({ id, name, priceDelta, costDelta, isDefault, sortOrder }) => ({
        id,
        name,
        priceDelta,
        costDelta,
        isDefault,
        sortOrder,
      }),
    ) ?? [{ ...emptyValue(), isDefault: true }, emptyValue()],
  });
  const { submit, error, saving } = useSaveForm(onSave, onClose);

  const single = form.selectionType === "SINGLE";

  const setType = (selectionType: OptionSelectionType) =>
    setForm((f) => ({
      ...f,
      selectionType,
      minSelect: selectionType === "SINGLE" ? Math.min(f.minSelect, 1) : 0,
      maxSelect:
        selectionType === "SINGLE" ? 1 : Math.max(2, f.values.length - 1),
      // BR-16: only single-choice groups have a default
      values: f.values.map((v, i) => ({
        ...v,
        isDefault: selectionType === "SINGLE" && i === 0,
      })),
    }));

  const setValue = (index: number, patch: Partial<ValueDraft>) =>
    setForm((f) => ({
      ...f,
      values: f.values.map((v, i) =>
        i === index
          ? { ...v, ...patch }
          : patch.isDefault
            ? { ...v, isDefault: false }
            : v,
      ),
    }));

  const removeValue = (index: number) =>
    setForm((f) => ({ ...f, values: f.values.filter((_, i) => i !== index) }));

  return (
    <Modal onClose={onClose} className="flex max-h-[92vh] max-w-xl flex-col">
      <ModalHeader
        title={isEdit ? "Sửa nhóm tuỳ chọn" : "Thêm nhóm tuỳ chọn"}
        subtitle="Ví dụ: Size, Mức đường, Mức đá, Topping"
        onClose={onClose}
      />

      <form
        onSubmit={submit(() => ({
          ...form,
          name: form.name.trim(),
          values: form.values.map((v, i) => ({
            ...v,
            name: v.name.trim(),
            sortOrder: i,
          })),
        }))}
        className="space-y-4 overflow-y-auto px-6 py-5"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="group-name" className={labelCls}>
              Tên nhóm <span className="text-red-500">*</span>
            </label>
            <input
              id="group-name"
              required
              maxLength={60}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
              placeholder="Ví dụ: Size"
            />
          </div>
          <div>
            <label htmlFor="group-type" className={labelCls}>
              Kiểu chọn
            </label>
            <select
              id="group-type"
              value={form.selectionType}
              onChange={(e) => setType(e.target.value as OptionSelectionType)}
              className={inputCls}
            >
              <option value="SINGLE">Chọn một (size, đường, đá)</option>
              <option value="MULTIPLE">Chọn nhiều (topping)</option>
            </select>
          </div>
        </div>

        {single ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.minSelect === 1}
              onChange={(e) =>
                setForm({ ...form, minSelect: e.target.checked ? 1 : 0 })
              }
              className="h-4 w-4 accent-(--color-primary)"
            />
            Bắt buộc chọn (khách phải chọn 1 giá trị, mặc định được chọn sẵn)
          </label>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="group-min" className={labelCls}>
                Chọn tối thiểu
              </label>
              <input
                id="group-min"
                type="number"
                min={0}
                value={form.minSelect}
                onChange={(e) =>
                  setForm({ ...form, minSelect: Number(e.target.value) })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="group-max" className={labelCls}>
                Chọn tối đa
              </label>
              <input
                id="group-max"
                type="number"
                min={1}
                value={form.maxSelect}
                onChange={(e) =>
                  setForm({ ...form, maxSelect: Number(e.target.value) })
                }
                className={inputCls}
              />
            </div>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className={labelCls}>Giá trị</span>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, values: [...f.values, emptyValue()] }))
              }
              className="cursor-pointer rounded-lg border border-(--color-border) bg-white px-2.5 py-1 text-xs font-medium text-(--color-primary) hover:bg-(--color-border-light)"
            >
              <i className="fa-solid fa-plus mr-1"></i>Thêm giá trị
            </button>
          </div>
          <div className="space-y-2">
            <div className="hidden grid-cols-[1fr_5.5rem_5.5rem_2.5rem_2rem] gap-2 px-1 text-[11px] font-medium text-(--color-text-muted) sm:grid">
              <span>Tên</span>
              <span>Giá chênh</span>
              <span>Vốn chênh</span>
              <span className="text-center">{single ? "Mặc định" : ""}</span>
              <span></span>
            </div>
            {form.values.map((v, i) => (
              <div
                key={v.id ?? `new-${i}`}
                className="grid grid-cols-[1fr_1fr_2.5rem_2rem] items-end gap-2 rounded-xl border border-(--color-border-light) p-2 sm:grid-cols-[1fr_5.5rem_5.5rem_2.5rem_2rem] sm:items-center sm:border-none sm:p-0"
              >
                <input
                  required
                  maxLength={60}
                  value={v.name}
                  onChange={(e) => setValue(i, { name: e.target.value })}
                  className={`${inputCls} col-span-4 sm:col-span-1`}
                  placeholder="Size L"
                  aria-label={`Tên giá trị ${i + 1}`}
                />
                <label className="text-[11px] text-(--color-text-muted)">
                  <span className="sm:sr-only">Giá chênh</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={v.priceDelta}
                    onChange={(e) =>
                      setValue(i, { priceDelta: Number(e.target.value) })
                    }
                    className={inputCls}
                    aria-label={`Giá chênh ${i + 1}`}
                  />
                </label>
                <label className="text-[11px] text-(--color-text-muted)">
                  <span className="sm:sr-only">Vốn chênh</span>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={v.costDelta}
                    onChange={(e) =>
                      setValue(i, { costDelta: Number(e.target.value) })
                    }
                    className={inputCls}
                    aria-label={`Giá vốn chênh ${i + 1}`}
                  />
                </label>
                <span className="flex justify-center">
                  {single && (
                    <input
                      type="radio"
                      name="default-value"
                      checked={v.isDefault}
                      onChange={() => setValue(i, { isDefault: true })}
                      className="h-4 w-4 accent-(--color-primary)"
                      aria-label={`Mặc định ${i + 1}`}
                    />
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => removeValue(i)}
                  disabled={form.values.length <= 1}
                  title="Xoá giá trị"
                  aria-label={`Xoá giá trị ${i + 1}`}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-(--color-text-muted) hover:text-red-500 disabled:opacity-30"
                >
                  <i className="fa-solid fa-trash text-xs"></i>
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-(--color-text-muted)">
            Giá chênh cộng vào giá món, giá vốn chênh cộng vào giá vốn để tính
            lợi nhuận (BR-17). Giá trị đã từng bán chỉ bị ẩn, đơn cũ vẫn giữ
            nguyên (BR-19).
          </p>
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
            {isEdit ? "Lưu thay đổi" : "Thêm nhóm"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
