"use client";

import { DEPARTMENTS } from "@/lib/constants";
import { useShift } from "@/lib/shift-context";
import { useEffect, useState } from "react";

import type { ShiftCreateModalProps } from "./ShiftSchedule.types";

export default function ShiftCreateModal({
  isOpen,
  onClose,
  defaultDate,
}: ShiftCreateModalProps) {
  const { createShift } = useShift();

  const [date, setDate] = useState(defaultDate ?? "2026-04-10");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [department, setDepartment] = useState("bar");
  const [maxStaff, setMaxStaff] = useState(2);
  const [wage, setWage] = useState(120000);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDate(defaultDate ?? "2026-04-10");
    }
  }, [defaultDate, isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--color-border-light) px-5 py-4">
          <div>
            <h2 className="text-foreground text-base font-bold">
              Tạo ca làm mới
            </h2>
            <p className="text-xs text-(--color-text-muted)">
              Thêm khung giờ ca làm cho nhân viên
            </p>
          </div>
          <button
            title="Close"
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-(--color-text-muted) transition hover:bg-gray-100"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

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
      </div>
    </div>
  );
}
