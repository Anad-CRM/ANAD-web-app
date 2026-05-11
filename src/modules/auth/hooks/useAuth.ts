"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/modules/auth/services/auth.service";
import { useAuthContext } from "@/modules/auth/stores/AuthContext";
import { useFeedback } from "@/core/contexts/FeedbackContext";
import type { LoginPayload, SignupPayload } from "@/modules/auth/types/auth.types";

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setAuthData, logout: ctxLogout } = useAuthContext();
  const { showLoader, hideLoader, showToast } = useFeedback();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function login(payload: LoginPayload) {
    setError(null);
    setIsPending(true);
    showLoader();
    try {
      const [loginResult] = await Promise.all([
        authService.login(payload),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
      const { user, token } = loginResult;
      setAuthData(user, token);
      
      showToast("Logged in successfully", "success");
      
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      router.push("/overview");
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Login failed";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setIsPending(false);
      hideLoader();
    }
  }

  async function signup(payload: SignupPayload) {
    setError(null);
    setIsPending(true);
    showLoader();
    try {
      await Promise.all([
        authService.signup(payload),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
      
      showToast("Sign up successful!", "success");
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      router.push("/login?registered=true");
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Signup failed";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setIsPending(false);
      hideLoader();
    }
  }

  function logout() {
    showLoader();
    setTimeout(async () => {
      ctxLogout();
      showToast("Logged out securely", "info");
      
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      hideLoader();
      router.push("/login");
    }, 600);
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
