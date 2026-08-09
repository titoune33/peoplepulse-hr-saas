"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, apiLogin, apiRegister, apiGetMe, apiCreateCheckoutSession, AuthPayload } from "./api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    companyName: string;
    companySize: string;
    industry: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  upgradeToPro: () => Promise<string | null>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check for existing token
  useEffect(() => {
    const storedToken = localStorage.getItem("pp_token");
    if (storedToken) {
      setToken(storedToken);
      // Validate token with backend
      apiGetMe().then((res) => {
        if (res.success) {
          setUser(res.data.user);
        } else {
          // Token invalid, clear it
          localStorage.removeItem("pp_token");
          setToken(null);
          setUser(null);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    if (res.success) {
      localStorage.setItem("pp_token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: res.error };
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    name: string;
    companyName: string;
    companySize: string;
    industry: string;
  }) => {
    const res = await apiRegister(data);
    if (res.success) {
      localStorage.setItem("pp_token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: res.error };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("pp_token");
    setToken(null);
    setUser(null);
  }, []);

  const upgradeToPro = useCallback(async () => {
    const res = await apiCreateCheckoutSession();
    if (res.success) {
      return res.data.url;
    }
    return null;
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, upgradeToPro }}>
      {children}
    </AuthContext.Provider>
  );
}
