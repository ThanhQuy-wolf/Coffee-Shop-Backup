"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "./types";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  registerPhone: string | null;
  setRegisterPhone: (phone: string | null) => void;
  completeRegistration: (phone: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database
const MOCK_AUTH_DB = {
  // Admin
  admin: { username: "admin", password: "admin", user: { id: 1, name: "Quản lý", role: "manager" as const, avatar: null, phone: "0912345678" } },
  
  // Staff (username and password are their names)
  "Nguyễn Văn An": { username: "Nguyễn Văn An", password: "Nguyễn Văn An", user: { id: 2, name: "Nguyễn Văn An", role: "staff" as const, avatar: null, phone: "0901234567" } },
  "Trần Thị Bình": { username: "Trần Thị Bình", password: "Trần Thị Bình", user: { id: 3, name: "Trần Thị Bình", role: "staff" as const, avatar: null, phone: "0902345678" } },
  "Lê Văn Cường": { username: "Lê Văn Cường", password: "Lê Văn Cường", user: { id: 4, name: "Lê Văn Cường", role: "staff" as const, avatar: null, phone: "0903456789" } },
  
  // Customers (username is phone number, password is custom)
  "0987654321": { username: "0987654321", password: "user1", user: { id: 5, name: "Khách hàng", role: "customer" as const, avatar: null, phone: "0987654321" } },
  "0976543210": { username: "0976543210", password: "user1", user: { id: 6, name: "Khách hàng", role: "customer" as const, avatar: null, phone: "0976543210" } },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [registerPhone, setRegisterPhone] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("coffee-shop-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const authEntry = MOCK_AUTH_DB[username as keyof typeof MOCK_AUTH_DB];
    
    if (authEntry && authEntry.password === password) {
      setUser(authEntry.user);
      localStorage.setItem("coffee-shop-user", JSON.stringify(authEntry.user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("coffee-shop-user");
  };

  const completeRegistration = (phone: string) => {
    // Create new customer account
    const newUser: User = {
      id: Date.now(),
      name: "Khách hàng",
      role: "customer",
      avatar: null,
      phone,
    };
    
    // Add to mock database (in real app, this would be API call)
    (MOCK_AUTH_DB as any)[phone] = {
      username: phone,
      password: "user1", // Default password for new customers
      user: newUser,
    };
    
    setUser(newUser);
    localStorage.setItem("coffee-shop-user", JSON.stringify(newUser));
    setRegisterPhone(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerPhone, setRegisterPhone, completeRegistration }}>
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
