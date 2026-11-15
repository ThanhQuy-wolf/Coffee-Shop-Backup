// A-1 → A-9 in docs/05-api.md
import type { AppNotification, AuthSession, User } from "../types";
import { apiPost, apiRequest, getAccessToken } from "./client";

/** Vietnamese mobile number: 10 digits starting with 03, 05, 07, 08, 09 (BR-01). */
export const VN_PHONE_REGEX = /^0[35789][0-9]{8}$/;

let currentRefreshToken: string | null = null;

/**
 * Remembers the refresh token that A-6 revokes on logout.
 *
 * @param token - refresh token of the session, or null after logout
 */
export function setRefreshToken(token: string | null) {
  currentRefreshToken = token;
}

export const authService = {
  /**
   * A-1: logs a customer in.
   *
   * @param phone - phone number used to register
   * @param password - account password
   * @returns the session
   * @throws {ApiError} 401 `BR-04` on a wrong phone or password (with
   *   `remainingAttempts`), 423 `BR-04` with `lockedUntil` when locked
   */
  loginCustomer(phone: string, password: string): Promise<AuthSession> {
    return apiPost<AuthSession>("/customer/login", { phone, password });
  },

  /**
   * A-2: logs a staff member or manager in.
   *
   * @param username - staff username
   * @param password - account password
   * @returns the session
   * @throws {ApiError} 401 `BR-04` on a wrong password, 423 `BR-04` when locked
   */
  loginStaff(username: string, password: string): Promise<AuthSession> {
    return apiPost<AuthSession>("/v1/auth/staff/login", {
      username,
      password,
    });
  },

  /**
   * A-3: sends a registration OTP by SMS. In the backend's dev profile the
   * code is always `123456`.
   *
   * @param phone - number to register
   * @returns seconds to wait before another OTP can be sent (P-01)
   * @throws {ApiError} 422 `BR-01` for an invalid or taken number,
   *   429 `BR-02` with `retryAfter` when asked again too early
   */
  requestOtp(phone: string): Promise<{ resendAfter: number }> {
    return apiPost("/v1/auth/otp/request", { phone });
  },

  /**
   * A-4: creates a customer account after checking the OTP, and logs it in.
   *
   * @param input.phone - number the OTP was sent to
   * @param input.otp - 6-digit code
   * @param input.password - new password
   * @param input.fullName - customer's name
   * @returns the session of the new account
   * @throws {ApiError} 422 `BR-02` for a wrong, expired or exhausted OTP,
   *   400 `VALIDATION` for a short password or missing name
   */
  register(input: {
    phone: string;
    otp: string;
    password: string;
    fullName: string;
  }): Promise<AuthSession> {
    return apiPost<AuthSession>("/v1/auth/register", input);
  },

  /**
   * A-5: exchanges a refresh token for a new session. `apiRequest` already
   * calls it on a 401, so pages do not need to.
   *
   * @param refreshToken - token from the current session
   * @returns a new session; the old refresh token stops working
   * @throws {ApiError} 401 `UNAUTHENTICATED` when the token is unknown,
   *   expired or reused
   */
  refresh(refreshToken: string): Promise<AuthSession> {
    return apiPost<AuthSession>("/v1/auth/refresh", { refreshToken });
  },

  /**
   * A-6: revokes the current refresh token. Errors are ignored, because the
   * session is dropped on this device either way.
   */
  async logout(): Promise<void> {
    // Read both tokens now: the caller clears them right after this call starts
    const access = getAccessToken();
    const refreshToken = currentRefreshToken;
    if (!access && !refreshToken) return;
    await apiRequest<void>(
      "POST",
      "/v1/auth/logout",
      { refreshToken },
      access ? { Authorization: `Bearer ${access}` } : {},
    ).catch(() => undefined);
  },

  /**
   * A-7: reads the logged-in user.
   *
   * @returns the current user
   * @throws {ApiError} 401 when nobody is logged in
   */
  getMe(): Promise<User> {
    return apiRequest<User>("GET", "/v1/me");
  },
};

export const notificationService = {
  /**
   * A-8: lists the current user's unread notifications, newest first.
   *
   * @returns notifications, or an empty list for guests
   * @throws {ApiError} when the backend cannot be reached
   */
  async list(): Promise<AppNotification[]> {
    if (!getAccessToken()) return [];
    return apiRequest<AppNotification[]>("GET", "/v1/me/notifications");
  },

  /**
   * A-9: marks a notification as read.
   *
   * @param id - notification id; an id of another user is ignored
   * @throws {ApiError} 401 when nobody is logged in
   */
  markRead(id: number): Promise<void> {
    return apiRequest<void>("POST", `/v1/me/notifications/${id}/read`);
  },
};
