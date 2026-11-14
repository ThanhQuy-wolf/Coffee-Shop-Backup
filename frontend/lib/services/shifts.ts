// W-1 → W-12 in docs/05-api.md
import {
  clone,
  db,
  delay,
  fail,
  mockNow,
  nextId,
  notify,
  requireActor,
  runJobs,
  shiftStart,
} from "../mock-data/db";
import type { AssignmentRow, ShiftRow } from "../mock-data/shifts";
import type {
  AssignmentStatus,
  Department,
  Shift,
  ShiftInput,
  StaffMember,
} from "../types";
import { timeToMinutes } from "../utils/date";

/** BR-43: statuses that hold a seat */
export const OCCUPYING_STATUSES: AssignmentStatus[] = [
  "REGISTERED",
  "LEAVE_REQUESTED",
  "ATTENDED",
  "ABSENT",
];

const occupies = (a: AssignmentRow) => OCCUPYING_STATUSES.includes(a.status);

function toShift(row: ShiftRow): Shift {
  const assignments = db.assignments.filter((a) => a.shiftId === row.id);
  const occupied = assignments.filter(occupies).length;
  return clone({
    ...row,
    occupied,
    remaining: Math.max(0, row.maxStaff - occupied),
    assignments: assignments
      .filter((a) => a.status !== "CANCELLED")
      .map((a) => ({
        ...a,
        staffName:
          db.accounts.find((u) => u.id === a.staffId)?.fullName ??
          `#${a.staffId}`,
      })),
  });
}

function findShift(id: number): ShiftRow {
  runJobs();
  const s = db.shifts.find((x) => x.id === id);
  if (!s) fail(404, "NOT_FOUND", "Không tìm thấy ca");
  return s;
}

function findAssignment(id: number) {
  runJobs();
  const a = db.assignments.find((x) => x.id === id);
  if (!a) fail(404, "NOT_FOUND", "Không tìm thấy phân ca");
  return { assignment: a, shift: findShift(a.shiftId) };
}

/** BR-45: half-open intervals, so 07:00–11:00 and 11:00–15:00 do not clash */
function overlaps(
  a: Pick<ShiftRow, "date" | "startTime" | "endTime">,
  b: typeof a,
) {
  return (
    a.date === b.date &&
    timeToMinutes(a.startTime) < timeToMinutes(b.endTime) &&
    timeToMinutes(b.startTime) < timeToMinutes(a.endTime)
  );
}

function clashFor(
  staffId: number,
  slot: Pick<ShiftRow, "date" | "startTime" | "endTime">,
  excludeShiftId: number,
) {
  return db.assignments
    .filter(
      (a) =>
        a.staffId === staffId && occupies(a) && a.shiftId !== excludeShiftId,
    )
    .map((a) => db.shifts.find((s) => s.id === a.shiftId)!)
    .find((s) => s.status === "OPEN" && overlaps(s, slot));
}

function hasStarted(s: ShiftRow) {
  return shiftStart(s).getTime() <= mockNow().getTime();
}

/** BR-40, BR-41 */
function validateShift(input: ShiftInput) {
  if (!input.date || !input.startTime || !input.endTime)
    fail(400, "VALIDATION", "Vui lòng điền đầy đủ ngày và giờ");
  if (timeToMinutes(input.endTime) <= timeToMinutes(input.startTime))
    fail(
      422,
      "BR-40",
      "Giờ kết thúc phải sau giờ bắt đầu, trong cùng một ngày",
    );
  if (
    !Number.isInteger(input.maxStaff) ||
    input.maxStaff < 1 ||
    input.maxStaff > 20
  )
    fail(422, "BR-41", "Số người tối đa từ 1 đến 20");
  if (!Number.isInteger(input.wage) || input.wage <= 0)
    fail(422, "BR-41", "Lương mỗi ca phải lớn hơn 0");
  if (!db.departments.some((d) => d.id === input.departmentId))
    fail(422, "VALIDATION", "Bộ phận không tồn tại");
}

export const shiftService = {
  /** Server clock. Mocked: starts on 10/04/2026 like the seed data. */
  now(): Date {
    return mockNow();
  },

  /** W-1 */
  async listDepartments(): Promise<Department[]> {
    await delay(60);
    requireActor(["STAFF", "MANAGER"]);
    return clone(db.departments);
  },

  /** W-2 */
  async listStaff(): Promise<StaffMember[]> {
    await delay(60);
    requireActor(["MANAGER"]);
    return db.accounts
      .filter((a) => a.role !== "CUSTOMER")
      .map((a) => ({
        id: a.id,
        fullName: a.fullName,
        role: a.role,
        departmentId: a.departmentId,
      }));
  },

  /** W-3 */
  async listShifts(filter: {
    from: string;
    to: string;
    departmentId?: number;
  }): Promise<Shift[]> {
    await delay();
    runJobs();
    requireActor(["STAFF", "MANAGER"]);
    return db.shifts
      .filter(
        (s) =>
          s.date >= filter.from &&
          s.date <= filter.to &&
          (!filter.departmentId || s.departmentId === filter.departmentId),
      )
      .map(toShift);
  },

  /** W-4 */
  async createShift(input: ShiftInput): Promise<Shift> {
    await delay();
    requireActor(["MANAGER"]);
    validateShift(input);
    const row: ShiftRow = {
      ...input,
      id: nextId(),
      status: "OPEN",
      version: 1,
    };
    db.shifts.push(row);
    return toShift(row);
  },

  /** W-5 — BR-41, BR-42, BR-27 */
  async updateShift(
    id: number,
    input: ShiftInput & { version: number },
  ): Promise<Shift> {
    await delay();
    const s = findShift(id);
    requireActor(["MANAGER"]);
    if (s.version !== input.version)
      fail(409, "BR-27", "Ca vừa được người khác cập nhật", {
        currentVersion: s.version,
      });
    if (s.status === "CANCELLED") fail(409, "ORDER_STATE", "Ca đã bị huỷ");
    validateShift(input);
    const holders = db.assignments.filter(
      (a) => a.shiftId === id && occupies(a),
    );
    if (input.maxStaff < holders.length)
      fail(
        422,
        "BR-41",
        `Ca đang có ${holders.length} người, không giảm số người tối đa xuống thấp hơn`,
      );
    for (const a of holders) {
      const clash = clashFor(a.staffId, input, id);
      if (clash) {
        const name = db.accounts.find((u) => u.id === a.staffId)?.fullName;
        fail(
          422,
          "BR-42",
          `Đổi giờ làm ${name} bị trùng ca ${clash.startTime}–${clash.endTime}`,
        );
      }
    }
    const { version: _, ...data } = input;
    Object.assign(s, data);
    s.version++;
    return toShift(s);
  },

  /** W-6 — BR-42: everyone in the shift is notified */
  async cancelShift(
    id: number,
    body: { reason: string; version: number },
  ): Promise<Shift> {
    await delay();
    const s = findShift(id);
    requireActor(["MANAGER"]);
    if (s.version !== body.version)
      fail(409, "BR-27", "Ca vừa được người khác cập nhật", {
        currentVersion: s.version,
      });
    if (hasStarted(s)) fail(422, "BR-42", "Không huỷ được ca đã bắt đầu");
    s.status = "CANCELLED";
    s.version++;
    for (const a of db.assignments.filter(
      (x) => x.shiftId === id && occupies(x),
    )) {
      a.status = "CANCELLED";
      notify(
        a.staffId,
        "SHIFT_CANCELLED",
        `Ca ${s.date} ${s.startTime}–${s.endTime} đã bị huỷ. Lý do: ${body.reason}`,
      );
    }
    return toShift(s);
  },

  /** W-7 — BR-43 → BR-46 */
  async register(shiftId: number): Promise<Shift> {
    await delay();
    const s = findShift(shiftId);
    const actor = requireActor(["STAFF", "MANAGER"]);
    const settings = db.settings;
    const startsIn = shiftStart(s).getTime() - mockNow().getTime();
    if (s.status !== "OPEN" || startsIn <= 0)
      fail(422, "BR-46", "Chỉ đăng ký được ca đang mở và chưa bắt đầu");
    if (startsIn > settings.shiftBookingDays * 86_400_000)
      fail(
        422,
        "BR-46",
        `Chỉ đăng ký được ca trong ${settings.shiftBookingDays} ngày tới`,
      );
    if (
      actor.role === "STAFF" &&
      actor.departmentId !== s.departmentId &&
      !s.allowCrossDepartment
    )
      fail(422, "BR-46", "Ca này thuộc bộ phận khác");
    if (
      db.assignments.some(
        (a) => a.shiftId === shiftId && a.staffId === actor.id && occupies(a),
      )
    )
      fail(409, "BR-44", "Bạn đã có trong ca này");
    if (
      db.assignments.filter((a) => a.shiftId === shiftId && occupies(a))
        .length >= s.maxStaff
    )
      fail(409, "BR-43", "Ca đã đủ người");
    const clash = clashFor(actor.id, s, shiftId);
    if (clash)
      fail(
        422,
        "BR-45",
        `Trùng giờ với ca ${clash.startTime}–${clash.endTime} bạn đã đăng ký`,
      );
    db.assignments.push({
      id: nextId(),
      shiftId,
      staffId: actor.id,
      status: "REGISTERED",
      leaveReason: null,
    });
    return toShift(s);
  },

  /** W-8 — BR-47 */
  async unregister(shiftId: number): Promise<Shift> {
    await delay();
    const s = findShift(shiftId);
    const actor = requireActor(["STAFF", "MANAGER"]);
    const mine = db.assignments.find(
      (a) =>
        a.shiftId === shiftId &&
        a.staffId === actor.id &&
        a.status === "REGISTERED",
    );
    if (!mine) fail(404, "NOT_FOUND", "Bạn chưa đăng ký ca này");
    const hours = db.settings.shiftCancelHours;
    if (shiftStart(s).getTime() - mockNow().getTime() < hours * 3_600_000)
      fail(
        422,
        "BR-47",
        `Ca bắt đầu trong chưa đầy ${hours} giờ, hãy gửi yêu cầu xin nghỉ`,
      );
    mine.status = "CANCELLED";
    return toShift(s);
  },

  /** W-9 — BR-48 */
  async requestLeave(assignmentId: number, reason: string): Promise<Shift> {
    await delay();
    const { assignment, shift } = findAssignment(assignmentId);
    const actor = requireActor(["STAFF", "MANAGER"]);
    if (assignment.staffId !== actor.id)
      fail(403, "FORBIDDEN", "Đây không phải phân ca của bạn");
    if (!reason.trim()) fail(422, "BR-48", "Vui lòng nhập lý do xin nghỉ");
    if (assignment.status !== "REGISTERED" || hasStarted(shift))
      fail(422, "BR-48", "Chỉ xin nghỉ được ca đã đăng ký và chưa bắt đầu");
    assignment.status = "LEAVE_REQUESTED";
    assignment.leaveReason = reason.trim();
    return toShift(shift);
  },

  /** W-10 — BR-48 */
  async decideLeave(assignmentId: number, approve: boolean): Promise<Shift> {
    await delay();
    const { assignment, shift } = findAssignment(assignmentId);
    requireActor(["MANAGER"]);
    if (assignment.status !== "LEAVE_REQUESTED" || hasStarted(shift))
      fail(422, "BR-48", "Yêu cầu nghỉ không còn chờ duyệt");
    assignment.status = approve ? "LEAVE_APPROVED" : "REGISTERED";
    notify(
      assignment.staffId,
      approve ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
      `Yêu cầu nghỉ ca ${shift.date} ${shift.startTime} đã ${approve ? "được duyệt" : "bị từ chối"}.`,
    );
    return toShift(shift);
  },

  /** W-11 — BR-49 */
  async markAttendance(
    assignmentId: number,
    status: "ATTENDED" | "ABSENT",
  ): Promise<Shift> {
    await delay();
    const { assignment, shift } = findAssignment(assignmentId);
    requireActor(["MANAGER"]);
    if (!hasStarted(shift))
      fail(422, "BR-49", "Chỉ chấm công được sau khi ca bắt đầu");
    const days = db.settings.attendanceEditDays;
    if (mockNow().getTime() - shiftStart(shift).getTime() > days * 86_400_000)
      fail(422, "BR-49", `Chỉ sửa chấm công được trong ${days} ngày`);
    if (!["REGISTERED", "ATTENDED", "ABSENT"].includes(assignment.status))
      fail(422, "BR-49", "Phân ca này không cần chấm công");
    assignment.status = status;
    return toShift(shift);
  },

  /** W-12 — BR-42 */
  async removeAssignment(assignmentId: number): Promise<Shift> {
    await delay();
    const { assignment, shift } = findAssignment(assignmentId);
    requireActor(["MANAGER"]);
    if (!occupies(assignment) || hasStarted(shift))
      fail(422, "BR-42", "Chỉ gỡ được người khỏi ca chưa bắt đầu");
    assignment.status = "CANCELLED";
    notify(
      assignment.staffId,
      "ASSIGNMENT_REMOVED",
      `Bạn đã được gỡ khỏi ca ${shift.date} ${shift.startTime}–${shift.endTime}.`,
    );
    return toShift(shift);
  },
};
