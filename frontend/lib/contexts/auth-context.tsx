"use client";

import { ReactNode, createContext, useContext, useState } from "react";

import { useHydrated, useLocalStorage } from "../hooks/use-local-storage";
import { loginRequest } from "../services";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  /**
   * false until the saved session has been read from localStorage.
   * Guards must wait for this before deciding the user is logged out.
   */
  isReady: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerPhone: string | null;
  setRegisterPhone: (phone: string | null) => void;
  completeRegistration: (phone: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "coffee-shop-user";

function parseUser(v: unknown): User | null {
  if (v && typeof v === "object" && "id" in v && "role" in v) return v as User;
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>(
    STORAGE_KEY,
    null,
    parseUser,
  );
  const isReady = useHydrated();
  const [registerPhone, setRegisterPhone] = useState<string | null>(null);

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      setUser(await loginRequest(phone, password));
      return true;
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
      return false;
    }
  };

  const logout = () => setUser(null);

  // Registration is still local-only (no backend endpoint yet).
  const completeRegistration = (phone: string) => {
    setUser({
      id: Date.now(),
      name: "Khách hàng",
      role: "customer",
      avatar: null,
      phone,
    });
    setRegisterPhone(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isReady,
        login,
        logout,
        registerPhone,
        setRegisterPhone,
        completeRegistration,
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
