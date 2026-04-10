"use client";

import { useState } from "react";
import AuthPanel from "@/modules/auth/components/AuthPanel";
import LoginPanel from "@/modules/auth/components/LoginPanel";
import CategorySelectPanel from "@/modules/auth/components/CategorySelectPanel";

type AuthView = "login" | "category";

export default function LoginPage() {
  const [view, setView] = useState<AuthView>("login");

  return (
    <AuthPanel>
      {view === "login" ? (
        <LoginPanel onCreateAccount={() => setView("category")} />
      ) : (
        <CategorySelectPanel onBack={() => setView("login")} />
      )}
    </AuthPanel>
  );
}