"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getToken, getUser, clearToken, setUser as setStoredUser, setToken as setStoredToken } from "@/core/utils/auth";
import type { User } from "@/modules/auth/types/auth.types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthData: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser<User>();
    Promise.resolve().then(() => {
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
      setIsLoading(false);
    });
  }, []);

  const setAuthData = useCallback((newUser: User, newToken: string) => {
    setStoredUser(newUser);
    setStoredToken(newToken);
    setUser(newUser);
    setToken(newToken);
  }, []);

  const updateUser = useCallback((newUser: User) => {
    setStoredUser(newUser);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        setAuthData,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return ctx;
}
