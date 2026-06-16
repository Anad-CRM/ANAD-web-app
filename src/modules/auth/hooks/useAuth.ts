"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/modules/auth/services/auth.service";
import { useAuthContext } from "@/modules/auth/stores/AuthContext";
import { useFeedback } from "@/core/contexts/FeedbackContext";
import type { LoginPayload, SignupPayload } from "@/modules/auth/types/auth.types";

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setAuthData, updateUser, logout: ctxLogout } = useAuthContext();
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
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
      const { user, token } = loginResult;

      console.log("role of the user--------", user.role)

      if (user.role !== "Admin" && user.role !== "organization_admin") {
        throw new Error("Web access only for Admin");
      }

      const { rememberMe, email, password } = payload;
      const { setRememberMe, saveCredentials, clearCredentials } = await import("@/core/utils/auth");

      if (rememberMe) {
        setRememberMe(true);
        saveCredentials(email, password);
      } else {
        clearCredentials();
      }

      setAuthData(user, token);
      showToast("Logged in successfully", "success");

      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push("/overview");
    } catch (error: unknown) {
      const e = error as { message?: string; data?: { status?: string } };
      const errMsg = e.message || "Login failed";
      setError(errMsg);

      if (!e.data || e.data.status !== "failed") {
        showToast(errMsg, "error");
      }

      throw error;
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
    updateUser,
  };
}
