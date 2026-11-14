// A-1 → A-9 in docs/05-api.md
import {
  currentActor,
  db,
  delay,
  fail,
  mockNow,
  nextId,
  requireActor,
  toUser,
} from "../mock-data/db";
import { MOCK_OTP } from "../mock-data/users";
import type { AppNotification, AuthSession, User, UserRole } from "../types";
import { apiPost } from "./client";

/** Vietnamese mobile number: 10 digits starting with 03, 05, 07, 08, 09 (BR-01). */
export const VN_PHONE_REGEX = /^0[35789][0-9]{8}$/;

const MAX_FAILED_LOGINS = 5; // P-04
const LOCK_MINUTES = 15; // P-05
const OTP_RESEND_SECONDS = 60; // P-01
const OTP_MAX_ATTEMPTS = 5; // P-02
const OTP_TTL_MINUTES = 5; // P-03

/**
 * Builds a mock session whose token `currentActor()` can decode.
 *
 * @param user - user to log in
 * @returns tokens `mock.<id>` / `mock-refresh.<id>`, valid 15 minutes
 */
function mockSession(user: User): AuthSession {
  return {
    accessToken: `mock.${user.id}`,
    refreshToken: `mock-refresh.${user.id}`,
    expiresIn: 900,
    user,
  };
}

/** Response of the current backend: a bare user, roles in lower case. */
interface LegacyUser {
  id: number;
  name?: string;
  fullName?: string;
  role: string;
  avatar?: string | null;
  phone?: string | null;
}

/**
 * Converts the old backend's user to the `User` of docs/05-api.md.
 *
 * @param u - body returned by `POST /api/customer/login` today
 * @returns the user, role upper-cased
 */
function fromLegacy(u: LegacyUser): User {
  return {
    id: u.id,
    role: u.role.toUpperCase() as UserRole,
    fullName: u.fullName ?? u.name ?? "Khách hàng",
    phone: u.phone ?? null,
    username: null,
    avatarUrl: u.avatar ?? null,
    departmentId: null,
  };
}

/**
 * Mirrors a user from the real backend into the mock and returns a mock
 * session. Only the mock knows the user's orders while the other endpoints
 * are mocked. Drop this once A-7 and O-3 are live.
 *
 * @param user - user returned by A-1
 * @returns a mock session for that user
 */
function bridgeToMock(user: User): AuthSession {
  if (!db.accounts.some((a) => a.id === user.id)) {
    db.accounts.push({ ...user, password: "" });
  }
  return mockSession(user);
}

/**
 * Refuses the login while the account is locked (BR-04).
 *
 * @param accountId - account trying to log in
 * @throws {ApiError} 423 `BR-04` with `lockedUntil`
 */
function checkLock(accountId: number) {
  const state = db.failedLogins.get(accountId);
  if (state && state.lockedUntil > mockNow().getTime()) {
    fail(423, "BR-04", "Tài khoản đang tạm khoá", {
      lockedUntil: new Date(state.lockedUntil).toISOString(),
    });
  }
}

/**
 * Counts a wrong password and locks the account for P-05 minutes after P-04
 * failures in a row (BR-04).
 *
 * @param accountId - account that failed
 * @throws {ApiError} always: 401 `BR-04` with `remainingAttempts`
 */
function recordFailure(accountId: number): never {
  const state = db.failedLogins.get(accountId) ?? { count: 0, lockedUntil: 0 };
  state.count++;
  if (state.count >= MAX_FAILED_LOGINS) {
    state.count = 0;
    state.lockedUntil = mockNow().getTime() + LOCK_MINUTES * 60_000;
  }
  db.failedLogins.set(accountId, state);
  fail(401, "BR-04", "Sai tên đăng nhập hoặc mật khẩu", {
    remainingAttempts: MAX_FAILED_LOGINS - state.count,
  });
}

export const authService = {
  /**
   * A-1: logs a customer in. This is the only call that reaches the real
   * backend; it accepts both the new `AuthSession` body and the old bare user.
   *
   * @param phone - phone number used to register
   * @param password - account password
   * @returns the session
   * @throws {ApiError} 401 on a wrong phone or password
   */
  async loginCustomer(phone: string, password: string): Promise<AuthSession> {
    const res = await apiPost<AuthSession | LegacyUser>("/customer/login", {
      phone,
      password,
    });
    const user = "accessToken" in res ? res.user : fromLegacy(res);
    return bridgeToMock(user);
  },

  /**
   * A-2: logs a staff member or manager in.
   *
   * @param username - staff username
   * @param password - account password
   * @returns the session
   * @throws {ApiError} 401 `BR-04` on a wrong password, 423 `BR-04` when locked
   */
  async loginStaff(username: string, password: string): Promise<AuthSession> {
    await delay();
    const account = db.accounts.find(
      (a) => a.username === username && a.role !== "CUSTOMER",
    );
    if (!account) fail(401, "BR-04", "Sai tên đăng nhập hoặc mật khẩu");
    checkLock(account.id);
    if (account.password !== password) recordFailure(account.id);
    db.failedLogins.delete(account.id);
    return mockSession(toUser(account));
  },

  /**
   * A-3: sends a registration OTP by SMS (mocked: the code is `MOCK_OTP`).
   *
   * @param phone - number to register
   * @returns seconds to wait before another OTP can be sent (P-01)
   * @throws {ApiError} 422 `BR-01` for an invalid or taken number,
   *   429 `BR-02` with `retryAfter` when asked again too early
   */
  async requestOtp(phone: string): Promise<{ resendAfter: number }> {
    await delay();
    if (!VN_PHONE_REGEX.test(phone))
      fail(422, "BR-01", "Số điện thoại không hợp lệ");
    if (db.accounts.some((a) => a.phone === phone))
      fail(422, "BR-01", "Số điện thoại đã có tài khoản");
    const now = mockNow().getTime();
    const last = db.otps.get(phone);
    if (last && now - last.sentAt < OTP_RESEND_SECONDS * 1000) {
      fail(429, "BR-02", "Vui lòng chờ trước khi gửi lại mã", {
        retryAfter: Math.ceil(
          (OTP_RESEND_SECONDS * 1000 - (now - last.sentAt)) / 1000,
        ),
      });
    }
    db.otps.set(phone, {
      phone,
      code: MOCK_OTP,
      attempts: 0,
      sentAt: now,
      expiresAt: now + OTP_TTL_MINUTES * 60_000,
      consumed: false,
    });
    return { resendAfter: OTP_RESEND_SECONDS };
  },

  /**
   * A-4: creates a customer account after checking the OTP, and logs it in.
   *
   * @param input.phone - number the OTP was sent to
   * @param input.otp - 6-digit code
   * @param input.password - new password
   * @param input.fullName - customer's name
   * @returns the session of the new account
   * @throws {ApiError} 422 `BR-02` for a wrong, expired or exhausted OTP
   */
  async register(input: {
    phone: string;
    otp: string;
    password: string;
    fullName: string;
  }): Promise<AuthSession> {
    await delay();
    const otp = db.otps.get(input.phone);
    if (!otp || otp.consumed || otp.expiresAt < mockNow().getTime())
      fail(422, "BR-02", "Mã OTP đã hết hạn, vui lòng gửi mã mới");
    if (otp.attempts >= OTP_MAX_ATTEMPTS)
      fail(422, "BR-02", "Nhập sai quá số lần cho phép, vui lòng gửi mã mới");
    if (otp.code !== input.otp) {
      otp.attempts++;
      fail(422, "BR-02", "Mã OTP không đúng", {
        remainingAttempts: OTP_MAX_ATTEMPTS - otp.attempts,
      });
    }
    otp.consumed = true;
    const user: User = {
      id: nextId(),
      role: "CUSTOMER",
      fullName: input.fullName,
      phone: input.phone,
      username: null,
      avatarUrl: null,
      departmentId: null,
    };
    db.accounts.push({ ...user, password: input.password });
    return mockSession(user);
  },

  /**
   * A-5: exchanges a refresh token for a new session.
   *
   * @param refreshToken - token from the current session
   * @returns a new session
   * @throws {ApiError} 401 `UNAUTHENTICATED` when the token is unknown
   */
  async refresh(refreshToken: string): Promise<AuthSession> {
    await delay();
    const id = Number(refreshToken.replace("mock-refresh.", ""));
    const account = db.accounts.find((a) => a.id === id);
    if (!account) fail(401, "UNAUTHENTICATED", "Phiên đăng nhập đã hết hạn");
    return mockSession(toUser(account));
  },

  /** A-6: revokes the current refresh token. */
  async logout(): Promise<void> {
    await delay(50);
  },

  /**
   * A-7: reads the logged-in user.
   *
   * @returns the current user
   * @throws {ApiError} 401 when nobody is logged in
   */
  async getMe(): Promise<User> {
    await delay();
    return toUser(requireActor());
  },
};

export const notificationService = {
  /**
   * A-8: lists the current user's unread notifications, newest first.
   *
   * @returns notifications, or an empty list for guests
   */
  async list(): Promise<AppNotification[]> {
    await delay();
    const actor = currentActor();
    if (!actor) return [];
    return db.notifications
      .filter((n) => n.userId === actor.id && !n.readAt)
      .map(({ userId: _, ...n }) => n)
      .reverse();
  },

  /**
   * A-9: marks a notification as read.
   *
   * @param id - notification id; an id of another user is ignored
   * @throws {ApiError} 401 when nobody is logged in
   */
  async markRead(id: number): Promise<void> {
    await delay(50);
    const actor = requireActor();
    const n = db.notifications.find(
      (x) => x.id === id && x.userId === actor.id,
    );
    if (n) n.readAt = mockNow().toISOString();
  },
};
