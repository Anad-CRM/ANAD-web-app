"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import AuthPanel from "@/modules/auth/components/AuthPanel";
import LoginPanel from "@/modules/auth/components/LoginPanel";
import CategorySelectPanel from "@/modules/auth/components/CategorySelectPanel";
import FullScreenLoader from "@/core/components/ui/FullScreenLoader";

type AuthView = "login" | "category";

export default function LoginPage() {
  const [view, setView] = useState<AuthView>("login");
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/overview");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <>
      {(isLoading || isAuthenticated) && <FullScreenLoader />}
      <AuthPanel>
        {view === "login" ? (
          <LoginPanel onCreateAccount={() => setView("category")} />
        ) : (
          <CategorySelectPanel onBack={() => setView("login")} />
        )}
      </AuthPanel>
    </>
  );
}