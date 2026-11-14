"use client";

import { ReactNode, createContext, useContext } from "react";

import { useHydrated, useLocalStorage } from "../hooks/use-local-storage";
import { authService, setAccessToken } from "../services";
import type { AuthSession, User, UserRole } from "../types";

interface AuthContextType {
  user: User | null;
  /**
   * false until the saved session has been read from localStorage.
   * Guards must wait for this before deciding the user is logged out.
   */
  isReady: boolean;
  loginCustomer: (phone: string, password: string) => Promise<User>;
  loginStaff: (username: string, password: string) => Promise<User>;
  /** Store a session returned by register (A-4) */
  startSession: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "coffee-shop-session";

/** FR-04: where each role lands after logging in */
export function homePathFor(role: UserRole): string {
  if (role === "MANAGER") return "/manager";
  if (role === "STAFF") return "/staff/orders";
  return "/feed";
}

function parseSession(v: unknown): AuthSession | null {
  if (v && typeof v === "object" && "accessToken" in v && "user" in v)
    return v as AuthSession;
  return null;
}

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
