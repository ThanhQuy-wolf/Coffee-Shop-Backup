"use client";

import { useAuth } from "@/lib/auth-context";
import { DEPARTMENTS } from "@/lib/constants";
import { useShift } from "@/lib/shift-context";
import { useState } from "react";

import type { ShiftDetailModalProps } from "./ShiftSchedule.types";

export default function ShiftDetailModal({
  shift,
  isOpen,
  onClose,
}: ShiftDetailModalProps) {
  const { user } = useAuth();
  const { registerShift, unregisterShift, deleteShift } = useShift();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen || !shift) return null;

  const dept = DEPARTMENTS.find((d) => d.id === shift.department);
  const isManager = user?.role === "manager";
  const isRegistered = user
    ? shift.registeredStaff.some((s) => s.id === user.id)
    : false;
  const isFull = shift.registeredStaff.length >= shift.maxStaff;

  const handleRegister = () => {
    if (!user) return;
    setError(null);
    setSuccess(null);
    const result = registerShift(shift.id, user.id, user.name);
    if (result.success) {
      setSuccess("Đăng ký ca thành công!");
      setTimeout(onClose, 1200);
    } else {
      setError(result.error ?? "Có lỗi xảy ra.");
    }
  };

  const handleUnregister = () => {
    if (!user) return;
    setError(null);
    unregisterShift(shift.id, user.id);
    setSuccess("Đã hủy đăng ký ca.");
    setTimeout(onClose, 1200);
  };

  const handleManagerUnregister = (staffId: number) => {
    unregisterShift(shift.id, staffId);
    setSuccess("Đã xóa nhân viên khỏi ca.");
  };

  const handleDelete = () => {
    deleteShift(shift.id);
    onClose();
  };

  const statusLabel = {
    available: "Còn trống",
    registered: "Đã đăng ký",
    approved_leave: "Nghỉ phép",
    absent: "Vắng mặt",
  };

  const statusColor = {
    available: "bg-blue-100 text-blue-700",
    registered: "bg-blue-200 text-blue-900",
    approved_leave: "bg-purple-100 text-purple-700",
    absent: "bg-red-100 text-red-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--color-border-light) px-5 py-4">
          <div className="flex items-center gap-3">
            {dept && <i className={`${dept.icon} text-(--color-primary)`}></i>}
            <div>
              <h2 className="text-foreground text-base font-bold">
                Chi tiết ca làm
              </h2>
              <p className="text-xs text-(--color-text-muted)">{dept?.name}</p>
            </div>
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

        {/* Body */}
        <div className="space-y-4 px-5 py-4">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[shift.status]}`}
            >
              {statusLabel[shift.status]}
            </span>
          </div>

          {/* Shift info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-semibold text-(--color-text-muted) uppercase">
                Ngày
              </p>
              <p className="text-foreground mt-1 text-sm font-bold">
                {new Date(shift.date + "T00:00:00").toLocaleDateString(
                  "vi-VN",
                  {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  },
                )}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-semibold text-(--color-text-muted) uppercase">
                Giờ làm
              </p>
              <p className="text-foreground mt-1 text-sm font-bold">
                {shift.startTime} – {shift.endTime}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-semibold text-(--color-text-muted) uppercase">
                Thời lượng
              </p>
              <p className="text-foreground mt-1 text-sm font-bold">
                {shift.durationHours} giờ
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-semibold text-(--color-text-muted) uppercase">
                Lương ca
              </p>
              <p className="mt-1 text-sm font-bold text-(--color-primary)">
                {shift.wage.toLocaleString("vi-VN")} VND
              </p>
            </div>
          </div>

          {/* Registered staff */}
          <div>
            <p className="mb-2 text-xs font-semibold text-(--color-text-secondary)">
              Nhân viên đã đăng ký ({shift.registeredStaff.length}/
              {shift.maxStaff})
            </p>
            {shift.registeredStaff.length === 0 ? (
              <p className="text-xs text-(--color-text-muted) italic">
                Chưa có ai đăng ký
              </p>
            ) : (
              <div className="space-y-2">
                {shift.registeredStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-(--color-primary)/10">
                        <i className="fa-solid fa-user text-[10px] text-(--color-primary)"></i>
                      </div>
                      <span className="text-foreground text-sm font-medium">
                        {staff.name}
                      </span>
                    </div>
                    {isManager && (
                      <button
                        type="button"
                        onClick={() => handleManagerUnregister(staff.id)}
                        className="cursor-pointer rounded-lg border-none bg-transparent px-2 py-1 text-xs text-red-500 transition hover:bg-red-50"
                      >
                        <i className="fa-solid fa-user-minus mr-1"></i>
                        Xóa
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
              <i className="fa-solid fa-circle-check mr-2"></i>
              {success}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 border-t border-(--color-border-light) px-5 py-4">
          {!isRegistered &&
            !isFull &&
            shift.status !== "approved_leave" &&
            shift.status !== "absent" && (
              <button
                type="button"
                onClick={handleRegister}
                className="flex-1 cursor-pointer rounded-xl border-none bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <i className="fa-solid fa-calendar-plus mr-2"></i>
                Đăng ký ca
              </button>
            )}
          {isRegistered && (
            <button
              type="button"
              onClick={handleUnregister}
              className="flex-1 cursor-pointer rounded-xl border border-red-200 bg-transparent px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <i className="fa-solid fa-calendar-minus mr-2"></i>
              Hủy đăng ký
            </button>
          )}
          {isManager && (
            <button
              type="button"
              onClick={handleDelete}
              className="cursor-pointer rounded-xl border border-red-200 bg-transparent px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <i className="fa-solid fa-trash mr-2"></i>
              Xóa ca
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-(--color-border-light) bg-transparent px-4 py-2.5 text-sm font-medium text-(--color-text-secondary) transition hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
