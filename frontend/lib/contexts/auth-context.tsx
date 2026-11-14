"use client";

import { ReactNode, createContext, useContext } from "react";

import { useHydrated, useLocalStorage } from "../hooks/use-local-storage";
import { authService, setAccessToken } from "../services";
import type { AuthSession, User, UserRole } from "../types";

interface AuthContextType {
  /** Logged-in user, `null` for guests. */
  user: User | null;
  /**
   * `false` until the saved session has been read from localStorage.
   * Guards must wait for it before deciding the user is logged out.
   */
  isReady: boolean;
  /**
   * Logs a customer in (A-1) and saves the session.
   *
   * @param phone - phone number used to register
   * @param password - account password
   * @returns the logged-in user
   * @throws {ApiError} `BR-04` on a wrong password or a locked account
   */
  loginCustomer: (phone: string, password: string) => Promise<User>;
  /**
   * Logs a staff member or manager in (A-2) and saves the session.
   *
   * @param username - staff username, e.g. `"an"`
   * @param password - account password
   * @returns the logged-in user
   * @throws {ApiError} `BR-04` on a wrong password or a locked account
   */
  loginStaff: (username: string, password: string) => Promise<User>;
  /**
   * Saves a session obtained elsewhere, e.g. right after registering (A-4).
   *
   * @param session - tokens and user returned by the API
   */
  startSession: (session: AuthSession) => void;
  /** Revokes the refresh token (A-6) and clears the saved session. */
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "coffee-shop-session";

/**
 * Finds the page a role lands on after logging in (FR-04).
 *
 * @param role - role of the logged-in user
 * @returns `/manager` for MANAGER, `/staff/orders` for STAFF, `/` for CUSTOMER
 */
export function homePathFor(role: UserRole): string {
  if (role === "MANAGER") return "/manager";
  if (role === "STAFF") return "/staff/orders";
  return "/";
}

/**
 * Validates the session read from localStorage.
 *
 * @param v - parsed JSON
 * @returns the session, or `null` when the shape is wrong
 */
function parseSession(v: unknown): AuthSession | null {
  if (v && typeof v === "object" && "accessToken" in v && "user" in v)
    return v as AuthSession;
  return null;
}

/**
 * Holds the login session for the whole app and keeps the access token of
 * the API client in sync with it. Mounted once in app/providers.tsx.
 *
 * @param props.children - the app
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useLocalStorage<AuthSession | null>(
    STORAGE_KEY,
    null,
    parseSession,
  );
  const isReady = useHydrated();

  // Set during render, not in an effect, so children's effects already send
  // the token on their first request.
  setAccessToken(session?.accessToken ?? null);

  const startSession = (next: AuthSession) => {
    setAccessToken(next.accessToken);
    setSession(next);
  };

  const loginCustomer = async (phone: string, password: string) => {
    const next = await authService.loginCustomer(phone, password);
    startSession(next);
    return next.user;
  };

  const loginStaff = async (username: string, password: string) => {
    const next = await authService.loginStaff(username, password);
    startSession(next);
    return next.user;
  };

  const logout = () => {
    void authService.logout();
    setAccessToken(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        isReady,
        loginCustomer,
        loginStaff,
        startSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Reads the session and the login/logout actions.
 *
 * @returns the auth context (see `AuthContextType`)
 * @throws {Error} when used outside `AuthProvider`
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
