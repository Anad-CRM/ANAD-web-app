"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/modules/auth/services/auth.service";
import { useAuthContext } from "@/modules/auth/stores/AuthContext";
import type { LoginPayload, SignupPayload } from "@/modules/auth/types/auth.types";

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setAuthData, logout: ctxLogout } =
    useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function login(payload: LoginPayload) {
    setError(null);
    setIsPending(true);
    try {
      const { user, token } = await authService.login(payload);
      setAuthData(user, token);
      router.push("/overview");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setIsPending(false);
    }
  }

  async function signup(payload: SignupPayload) {
    setError(null);
    setIsPending(true);
    try {
      await authService.signup(payload);
      router.push("/login?registered=true");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setIsPending(false);
    }
  }

  function logout() {
    ctxLogout();
    router.push("/login");
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isPending,
    error,
    login,
    signup,
    logout,
  };
}
