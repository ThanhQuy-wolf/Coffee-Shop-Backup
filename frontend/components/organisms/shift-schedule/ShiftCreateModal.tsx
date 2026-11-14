"use client";

import { Modal, ModalHeader } from "@/components/molecules/modal";
import { DEPARTMENTS } from "@/lib/constants";
import { useShift } from "@/lib/contexts/shift-context";
import { SCHEDULE_TODAY, formatDateISO } from "@/lib/utils/date";
import { useState } from "react";

import type { ShiftCreateModalProps } from "./ShiftSchedule.types";

export default function ShiftCreateModal({
  isOpen,
  onClose,
  defaultDate,
}: ShiftCreateModalProps) {
  const { createShift } = useShift();

  const [date, setDate] = useState(
    defaultDate ?? formatDateISO(SCHEDULE_TODAY),
  );
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [department, setDepartment] = useState("bar");
  const [maxStaff, setMaxStaff] = useState(2);
  const [wage, setWage] = useState(120000);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!date || !startTime || !endTime) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    if (endMinutes <= startMinutes) {
      setError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    const durationHours = (endMinutes - startMinutes) / 60;

    createShift({
      date,
      startTime,
      endTime,
      durationHours,
      wage,
      department,
      maxStaff,
      registeredStaff: [],
      status: "available",
    });

    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        title="Tạo ca làm mới"
        subtitle="Thêm khung giờ ca làm cho nhân viên"
        onClose={onClose}
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
        {/* Date */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-(--color-text-secondary)">
            Ngày
          </label>
          <input
            title="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-foreground w-full rounded-xl border border-(--color-border-light) px-3 py-2.5 text-sm transition outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
          />
        </div>

        {/* Time range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-(--color-text-secondary)">
              Giờ bắt đầu
            </label>
            <input
              title="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="text-foreground w-full rounded-xl border border-(--color-border-light) px-3 py-2.5 text-sm transition outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-(--color-text-secondary)">
              Giờ kết thúc
            </label>
            <input
              title="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="text-foreground w-full rounded-xl border border-(--color-border-light) px-3 py-2.5 text-sm transition outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
            />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-(--color-text-secondary)">
            Bộ phận
          </label>
          <select
            title="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="text-foreground w-full rounded-xl border border-(--color-border-light) px-3 py-2.5 text-sm transition outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Max staff & Wage */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-(--color-text-secondary)">
              Số nhân viên tối đa
            </label>
            <input
              title="Max Staff"
              type="number"
              min={1}
              max={10}
              value={maxStaff}
              onChange={(e) => setMaxStaff(Number(e.target.value))}
              className="text-foreground w-full rounded-xl border border-(--color-border-light) px-3 py-2.5 text-sm transition outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-(--color-text-secondary)">
              Lương ca (VND)
            </label>
            <input
              title="Wage"
              type="number"
              min={0}
              step={10000}
              value={wage}
              onChange={(e) => setWage(Number(e.target.value))}
              className="text-foreground w-full rounded-xl border border-(--color-border-light) px-3 py-2.5 text-sm transition outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 cursor-pointer rounded-xl border-none bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            Tạo ca làm
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
