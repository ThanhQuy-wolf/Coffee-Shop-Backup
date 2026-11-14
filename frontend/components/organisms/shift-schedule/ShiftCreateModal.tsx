"use client";

import { Modal, ModalHeader } from "@/components/molecules/modal";
import { useShift } from "@/lib/contexts/shift-context";
import { SCHEDULE_TODAY, formatDateISO, timeToMinutes } from "@/lib/utils/date";
import { errorMessage } from "@/lib/utils/errors";
import { useState } from "react";

import type { ShiftFormModalProps } from "./ShiftSchedule.types";

const inputCls =
  "text-foreground w-full rounded-xl border border-(--color-border-light) px-3 py-2.5 text-sm transition outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)";
const labelCls =
  "mb-1 block text-xs font-semibold text-(--color-text-secondary)";

/** Create (FR-23) or edit (FR-24) a shift. */
export default function ShiftCreateModal({
  onClose,
  defaultDate,
  shift,
}: ShiftFormModalProps) {
  const { createShift, updateShift, departments } = useShift();
  const isEdit = !!shift;

  const [form, setForm] = useState({
    date: shift?.date ?? defaultDate ?? formatDateISO(SCHEDULE_TODAY),
    startTime: shift?.startTime ?? "08:00",
    endTime: shift?.endTime ?? "12:00",
    departmentId: shift?.departmentId ?? departments[0]?.id ?? 0,
    maxStaff: shift?.maxStaff ?? 2,
    wage: shift?.wage ?? 120000,
    allowCrossDepartment: shift?.allowCrossDepartment ?? false,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Same check as the server (BR-40), so the common mistake fails fast
    if (timeToMinutes(form.endTime) <= timeToMinutes(form.startTime)) {
      setError("Giờ kết thúc phải sau giờ bắt đầu, trong cùng một ngày.");
      return;
    }
    setSaving(true);
    try {
      if (shift) await updateShift(shift.id, form, shift.version);
      else await createShift(form);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        title={isEdit ? "Sửa ca làm" : "Tạo ca làm mới"}
        subtitle={
          isEdit
            ? "Người đã đăng ký sẽ được kiểm tra trùng lịch"
            : "Thêm khung giờ ca làm cho nhân viên"
        }
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
        <div>
          <label htmlFor="shift-date" className={labelCls}>
            Ngày
          </label>
          <input
            id="shift-date"
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="shift-start" className={labelCls}>
              Giờ bắt đầu
            </label>
            <input
              id="shift-start"
              type="time"
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="shift-end" className={labelCls}>
              Giờ kết thúc
            </label>
            <input
              id="shift-end"
              type="time"
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="shift-dept" className={labelCls}>
            Bộ phận
          </label>
          <select
            id="shift-dept"
            value={form.departmentId}
            onChange={(e) => set("departmentId", Number(e.target.value))}
            className={inputCls}
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="shift-max" className={labelCls}>
              Số người tối đa (1–20)
            </label>
            <input
              id="shift-max"
              type="number"
              min={1}
              max={20}
              value={form.maxStaff}
              onChange={(e) => set("maxStaff", Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="shift-wage" className={labelCls}>
              Lương ca (VND)
            </label>
            <input
              id="shift-wage"
              type="number"
              min={1}
              step={10000}
              value={form.wage}
              onChange={(e) => set("wage", Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-(--color-text-secondary)">
          <input
            type="checkbox"
            checked={form.allowCrossDepartment}
            onChange={(e) => set("allowCrossDepartment", e.target.checked)}
          />
          Cho phép nhân viên bộ phận khác đăng ký (BR-46)
        </label>

        {error && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 cursor-pointer rounded-xl border-none bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <i
              className={`fa-solid ${isEdit ? "fa-floppy-disk" : "fa-plus"} mr-2`}
            ></i>
            {isEdit ? "Lưu thay đổi" : "Tạo ca làm"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-(--color-border-light) bg-transparent px-4 py-2.5 text-sm font-medium text-(--color-text-secondary) transition hover:bg-gray-50"
          >
            Hủy
          </button>
        </div>
      </form>
    </Modal>
  );
}
