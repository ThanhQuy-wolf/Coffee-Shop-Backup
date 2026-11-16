// W-1 → W-12 in docs/05-api.md.
import type {
  AssignmentStatus,
  Department,
  Shift,
  ShiftInput,
  StaffMember,
} from "../types";
import { apiRequest, query } from "./client";

/** Assignment statuses that hold a seat in a shift (BR-43). */
export const OCCUPYING_STATUSES: AssignmentStatus[] = [
  "REGISTERED",
  "LEAVE_REQUESTED",
  "ATTENDED",
  "ABSENT",
];

export const shiftService = {
  /**
   * Clock used to tell past shifts from upcoming ones.
   *
   * @returns the current time
   */
  now(): Date {
    return new Date();
  },

  /**
   * W-1: lists the shop's departments.
   *
   * @returns all departments
   * @throws {ApiError} 401/403 when the caller is not staff or manager
   */
  listDepartments(): Promise<Department[]> {
    return apiRequest<Department[]>("GET", "/v1/departments");
  },

  /**
   * W-2: lists staff and the manager, for assigning shifts.
   *
   * @returns every non-customer account
   * @throws {ApiError} 401/403 when the caller is not the manager
   */
  listStaff(): Promise<StaffMember[]> {
    return apiRequest<StaffMember[]>("GET", "/v1/staff");
  },

  /**
   * W-3: lists shifts in a date range.
   *
   * @param filter - date range and filters
   * @param filter.from - first day, `YYYY-MM-DD`, inclusive
   * @param filter.to - last day, `YYYY-MM-DD`, inclusive
   * @param filter.departmentId - only this department
   * @returns matching shifts with seat counts
   * @throws {ApiError} 401/403 when the caller is not staff or manager
   * @throws {ApiError} 400 `VALIDATION` for a malformed or too long range
   */
  listShifts(filter: {
    from: string;
    to: string;
    departmentId?: number;
  }): Promise<Shift[]> {
    return apiRequest<Shift[]>("GET", `/v1/shifts${query(filter)}`);
  },

  /**
   * W-4: creates an open shift.
   *
   * @param input - date, times, department, `maxStaff`, wage and
   *   cross-department flag
   * @returns the new shift
   * @throws {ApiError} 401/403 when the caller is not the manager
   * @throws {ApiError} 400 `VALIDATION`, 422 `BR-40` / `BR-41` for bad times,
   *   wage or headcount
   */
  createShift(input: ShiftInput): Promise<Shift> {
    return apiRequest<Shift>("POST", "/v1/shifts", input);
  },

  /**
   * W-5: edits a shift. People already in it stay, so `maxStaff` cannot drop
   * below their number and new times must not clash with their other shifts.
   *
   * @param id - shift id
   * @param input - the new values plus the version the manager last saw
   * @returns the updated shift
   * @throws {ApiError} 409 `BR-27` when the shift changed in the meantime
   * @throws {ApiError} 409 `SHIFT_STATE` when the shift was cancelled
   * @throws {ApiError} 422 `BR-41` when `maxStaff` is below the current headcount
   * @throws {ApiError} 422 `BR-42` when the new times clash for someone in the shift
   */
  updateShift(
    id: number,
    input: ShiftInput & { version: number },
  ): Promise<Shift> {
    return apiRequest<Shift>("PUT", `/v1/shifts/${id}`, input);
  },

  /**
   * W-6: cancels a shift that has not started. Everyone in it is removed and
   * notified with the reason (BR-42).
   *
   * @param id - shift id
   * @param body - request body
   * @param body.reason - shown to the staff in the notification
   * @param body.version - the version the manager last saw
   * @returns the cancelled shift
   * @throws {ApiError} 409 `BR-27` when the shift changed in the meantime
   * @throws {ApiError} 409 `SHIFT_STATE` when the shift was already cancelled
   * @throws {ApiError} 422 `BR-42` when the shift has already started
   */
  cancelShift(
    id: number,
    body: { reason: string; version: number },
  ): Promise<Shift> {
    return apiRequest<Shift>("POST", `/v1/shifts/${id}/cancel`, body);
  },

  /**
   * W-7: the caller takes a seat in a shift.
   *
   * @param shiftId - shift id
   * @returns the updated shift
   * @throws {ApiError} 422 `BR-46` when the shift is not open, has started, is
   *   beyond the booking window, or belongs to another department
   * @throws {ApiError} 409 `BR-44` when the caller is already in it
   * @throws {ApiError} 409 `BR-43` when the shift is full
   * @throws {ApiError} 422 `BR-45` when it overlaps another shift of the caller
   */
  register(shiftId: number): Promise<Shift> {
    return apiRequest<Shift>("POST", `/v1/shifts/${shiftId}/registrations`);
  },

  /**
   * W-8: the caller gives up a seat. Only allowed until a set number of hours
   * before the start; after that they must request leave instead (BR-47).
   *
   * @param shiftId - shift id
   * @returns the updated shift
   * @throws {ApiError} 404 `NOT_FOUND` when the caller is not registered
   * @throws {ApiError} 422 `BR-47` when the shift starts too soon
   */
  unregister(shiftId: number): Promise<Shift> {
    return apiRequest<Shift>(
      "DELETE",
      `/v1/shifts/${shiftId}/registrations/me`,
    );
  },

  /**
   * W-9: the caller asks the manager to be excused from a shift. The seat
   * stays held until the manager decides (BR-48).
   *
   * @param assignmentId - the caller's assignment
   * @param reason - why; required
   * @returns the updated shift
   * @throws {ApiError} 403 `FORBIDDEN` when the assignment is someone else's
   * @throws {ApiError} 422 `BR-48` when the reason is empty, the assignment is
   *   not REGISTERED, or the shift has started
   */
  requestLeave(assignmentId: number, reason: string): Promise<Shift> {
    return apiRequest<Shift>(
      "POST",
      `/v1/shift-assignments/${assignmentId}/leave-request`,
      { reason },
    );
  },

  /**
   * W-10: the manager approves or rejects a leave request and the staff member
   * is notified. Rejecting puts the assignment back to REGISTERED.
   *
   * @param assignmentId - the assignment with the request
   * @param approve - `true` to approve
   * @returns the updated shift
   * @throws {ApiError} 422 `BR-48` when nothing is waiting or the shift has started
   */
  decideLeave(assignmentId: number, approve: boolean): Promise<Shift> {
    return apiRequest<Shift>(
      "POST",
      `/v1/shift-assignments/${assignmentId}/leave-decision`,
      { approve },
    );
  },

  /**
   * W-11: the manager records attendance, from the shift start until a set
   * number of days later (BR-49).
   *
   * @param assignmentId - the assignment
   * @param status - `ATTENDED` or `ABSENT`
   * @returns the updated shift
   * @throws {ApiError} 422 `BR-49` when outside that window or the assignment
   *   is not one that needs attendance
   */
  markAttendance(
    assignmentId: number,
    status: "ATTENDED" | "ABSENT",
  ): Promise<Shift> {
    return apiRequest<Shift>(
      "POST",
      `/v1/shift-assignments/${assignmentId}/attendance`,
      { status },
    );
  },

  /**
   * W-12: the manager removes someone from a shift that has not started; they
   * are notified (BR-42).
   *
   * @param assignmentId - the assignment
   * @returns the updated shift
   * @throws {ApiError} 422 `BR-42` when the seat is not held or the shift has started
   */
  removeAssignment(assignmentId: number): Promise<Shift> {
    return apiRequest<Shift>("DELETE", `/v1/shift-assignments/${assignmentId}`);
  },
};
