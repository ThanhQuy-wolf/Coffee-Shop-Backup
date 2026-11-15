"use client";

import { Alert, Icon } from "@/components/atoms";
import { SHIFT_VIEW_STYLES } from "@/components/molecules/cards";
import { Modal, ModalHeader } from "@/components/molecules/modal";
import { useAuth } from "@/lib/contexts/auth-context";
import { isSeatHolder, useShift } from "@/lib/contexts/shift-context";
import { shiftService } from "@/lib/services/shifts";
import type { AssignmentStatus } from "@/lib/types";
import { formatVND } from "@/lib/utils/currency";
import { errorCode, errorMessage } from "@/lib/utils/errors";
import { useState } from "react";

import type { ShiftDetailModalProps } from "./ShiftSchedule.types";

/** Label and colours of each assignment status in the staff list. */
const ASSIGNMENT_LABEL: Record<
  AssignmentStatus,
  { label: string; cls: string }
> = {
  REGISTERED: { label: "Đã đăng ký", cls: "bg-blue-100 text-blue-800" },
  LEAVE_REQUESTED: {
    label: "Chờ duyệt nghỉ",
    cls: "bg-(--color-warning-bg) text-(--color-warning)",
  },
  LEAVE_APPROVED: { label: "Nghỉ phép", cls: "bg-purple-100 text-purple-700" },
  ATTENDED: {
    label: "Có mặt",
    cls: "bg-(--color-success-bg) text-(--color-success)",
  },
  ABSENT: {
    label: "Vắng mặt",
    cls: "bg-(--color-danger-bg) text-(--color-danger)",
  },
  CANCELLED: { label: "Đã huỷ", cls: "bg-gray-100 text-gray-600" },
};

const btn =
  "cursor-pointer rounded-lg border-none px-2 py-1 text-xs font-medium transition";

/**
 * Shift details with the actions the viewer may take. Staff register, give
 * up a seat or request leave; the manager edits or cancels the shift, decides
 * leave requests, records attendance and removes people. Too close to the
 * start, giving up a seat turns into a leave request (BR-47).
 * @param props.shiftId Shift to show, looked up in the context so the modal
 *   reflects each action; null renders nothing.
 * @param props.onClose Closes the modal.
 * @param props.onEdit Opens the edit form for the shift.
 */
export default function ShiftDetailModal({
  shiftId,
  onClose,
  onEdit,
}: ShiftDetailModalProps) {
  const { user } = useAuth();
  const ctx = useShift();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);

  const shift = shiftId === null ? undefined : ctx.getShift(shiftId);
  if (!shift || !user) return null;

  const dept = ctx.departments.find((d) => d.id === shift.departmentId);
  const isManager = user.role === "MANAGER";
  const started =
    new Date(`${shift.date}T${shift.startTime}:00`) <= shiftService.now();
  const mine = shift.assignments.find(
    (a) => a.staffId === user.id && a.status !== "LEAVE_APPROVED",
  );
  const style = SHIFT_VIEW_STYLES[shift.view];

  const act = async (
    fn: () => Promise<void>,
    ok: string,
    after?: () => void,
  ) => {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await fn();
      setSuccess(ok);
      after?.();
    } catch (err) {
      setError(errorMessage(err));
      // BR-47: too close to the start, offer the leave request instead
      if (errorCode(err) === "BR-47") setShowLeaveForm(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onClose} className="max-w-lg">
      <ModalHeader
        title="Chi tiết ca làm"
        subtitle={dept?.name}
        leading={
          dept && <Icon name={dept.icon} className="text-(--color-primary)" />
        }
        onClose={onClose}
      />

      <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
          >
            {style.label}
          </span>
          {shift.allowCrossDepartment && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              Cho phép làm chéo bộ phận
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            [
              "Ngày",
              new Date(shift.date + "T00:00:00").toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
            ],
            ["Giờ làm", `${shift.startTime} – ${shift.endTime}`],
            [
              "Số người",
              `${shift.occupied}/${shift.maxStaff} (còn ${shift.remaining})`,
            ],
            ["Lương ca", formatVND(shift.wage)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-semibold text-(--color-text-muted) uppercase">
                {label}
              </p>
              <p className="text-foreground mt-1 text-sm font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-(--color-text-secondary)">
            Nhân viên trong ca
          </p>
          {shift.assignments.length === 0 ? (
            <p className="text-xs text-(--color-text-muted) italic">
              Chưa có ai đăng ký
            </p>
          ) : (
            <ul className="space-y-2">
              {shift.assignments.map((a) => {
                const tag = ASSIGNMENT_LABEL[a.status];
                return (
                  <li key={a.id} className="rounded-xl bg-gray-50 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-medium">
                          {a.staffName}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tag.cls}`}
                        >
                          {tag.label}
                        </span>
                      </div>
                      {isManager && (
                        <div className="flex flex-wrap gap-1">
                          {a.status === "LEAVE_REQUESTED" && !started && (
                            <>
                              <button
                                type="button"
                                disabled={busy}
                                className={`${btn} bg-(--color-success-bg) text-(--color-success) hover:bg-green-200`}
                                onClick={() =>
                                  act(
                                    () => ctx.decideLeave(a.id, true),
                                    "Đã duyệt nghỉ.",
                                  )
                                }
                              >
                                Duyệt
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                className={`${btn} bg-gray-200 text-gray-700 hover:bg-gray-300`}
                                onClick={() =>
                                  act(
                                    () => ctx.decideLeave(a.id, false),
                                    "Đã từ chối yêu cầu nghỉ.",
                                  )
                                }
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                          {started &&
                            ["REGISTERED", "ATTENDED", "ABSENT"].includes(
                              a.status,
                            ) && (
                              <>
                                <button
                                  type="button"
                                  disabled={busy}
                                  className={`${btn} bg-(--color-success-bg) text-(--color-success) hover:bg-green-200`}
                                  onClick={() =>
                                    act(
                                      () =>
                                        ctx.markAttendance(a.id, "ATTENDED"),
                                      "Đã chấm có mặt.",
                                    )
                                  }
                                >
                                  Có mặt
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  className={`${btn} bg-(--color-danger-bg) text-(--color-danger) hover:bg-(--color-danger)/15`}
                                  onClick={() =>
                                    act(
                                      () => ctx.markAttendance(a.id, "ABSENT"),
                                      "Đã chấm vắng mặt.",
                                    )
                                  }
                                >
                                  Vắng
                                </button>
                              </>
                            )}
                          {!started && isSeatHolder(a.status) && (
                            <button
                              type="button"
                              disabled={busy}
                              className={`${btn} bg-transparent text-(--color-danger) hover:bg-(--color-danger-bg)`}
                              onClick={() =>
                                act(
                                  () => ctx.removeAssignment(a.id),
                                  "Đã gỡ nhân viên khỏi ca và gửi thông báo.",
                                )
                              }
                            >
                              <Icon name="user-minus" className="mr-1" />
                              Gỡ
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {a.leaveReason && a.status !== "REGISTERED" && (
                      <p className="mt-1 text-xs text-(--color-text-muted)">
                        Lý do nghỉ: {a.leaveReason}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {showLeaveForm && mine?.status === "REGISTERED" && (
          <div className="space-y-2 rounded-xl border border-(--color-warning)/30 bg-(--color-warning-bg) p-3">
            <label
              htmlFor="leave-reason"
              className="text-xs font-semibold text-(--color-warning)"
            >
              Lý do xin nghỉ
            </label>
            <textarea
              id="leave-reason"
              rows={2}
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="w-full rounded-lg border border-(--color-warning)/30 bg-white px-3 py-2 text-sm outline-none"
              placeholder="Ví dụ: thi cuối kỳ"
            />
            <button
              type="button"
              disabled={busy || !leaveReason.trim()}
              onClick={() =>
                act(
                  () => ctx.requestLeave(mine.id, leaveReason),
                  "Đã gửi yêu cầu nghỉ, chờ quản lý duyệt.",
                  () => setShowLeaveForm(false),
                )
              }
              className="w-full cursor-pointer rounded-lg border-none bg-amber-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Gửi yêu cầu nghỉ
            </button>
          </div>
        )}

        {showCancelForm && (
          <div className="space-y-2 rounded-xl border border-(--color-danger)/30 bg-(--color-danger-bg) p-3">
            <label
              htmlFor="cancel-reason"
              className="text-xs font-semibold text-(--color-danger)"
            >
              Lý do huỷ ca (gửi tới nhân viên trong ca)
            </label>
            <textarea
              id="cancel-reason"
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full rounded-lg border border-(--color-danger)/30 bg-white px-3 py-2 text-sm outline-none"
            />
            <button
              type="button"
              disabled={busy || !cancelReason.trim()}
              onClick={() =>
                act(
                  () => ctx.cancelShift(shift.id, cancelReason, shift.version),
                  "Đã huỷ ca.",
                  onClose,
                )
              }
              className="w-full cursor-pointer rounded-lg border-none bg-(--color-danger) px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Xác nhận huỷ ca
            </button>
          </div>
        )}

        <Alert message={error} />
        {success && (
          <div
            role="status"
            className="rounded-xl bg-(--color-success-bg) px-4 py-3 text-sm text-(--color-success)"
          >
            <Icon name="circle-check" className="mr-2" />
            {success}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-(--color-border-light) px-5 py-4">
        {!mine && !started && shift.remaining > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              act(() => ctx.register(shift.id), "Đăng ký ca thành công!")
            }
            className="flex-1 cursor-pointer rounded-xl border-none bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Icon name="calendar-plus" className="mr-2" />
            Đăng ký ca
          </button>
        )}
        {mine?.status === "REGISTERED" && !started && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                act(() => ctx.unregister(shift.id), "Đã huỷ đăng ký ca.")
              }
              className="flex-1 cursor-pointer rounded-xl border border-(--color-danger)/30 bg-transparent px-4 py-2.5 text-sm font-semibold text-(--color-danger) transition hover:bg-(--color-danger-bg)"
            >
              <Icon name="calendar-minus" className="mr-2" />
              Huỷ đăng ký
            </button>
            <button
              type="button"
              onClick={() => setShowLeaveForm((v) => !v)}
              className="cursor-pointer rounded-xl border border-(--color-warning)/30 bg-transparent px-4 py-2.5 text-sm font-semibold text-(--color-warning) transition hover:bg-(--color-warning-bg)"
            >
              Xin nghỉ
            </button>
          </>
        )}
        {isManager && !started && (
          <>
            <button
              type="button"
              onClick={() => onEdit(shift)}
              className="cursor-pointer rounded-xl border border-(--color-border-light) bg-transparent px-4 py-2.5 text-sm font-semibold text-(--color-text-secondary) transition hover:bg-gray-50"
            >
              <Icon name="pen" className="mr-2" />
              Sửa ca
            </button>
            <button
              type="button"
              onClick={() => setShowCancelForm((v) => !v)}
              className="cursor-pointer rounded-xl border border-(--color-danger)/30 bg-transparent px-4 py-2.5 text-sm font-semibold text-(--color-danger) transition hover:bg-(--color-danger-bg)"
            >
              <Icon name="ban" className="mr-2" />
              Huỷ ca
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-xl border border-(--color-border-light) bg-transparent px-4 py-2.5 text-sm font-medium text-(--color-text-secondary) transition hover:bg-gray-50"
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
}
