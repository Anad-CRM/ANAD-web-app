"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <style>{`
          .dash-loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-bg); }
          .dash-spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.7s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="dash-shell">
      <Sidebar />
      <div className="dash-main">
        <Topbar />
        <main className="dash-content">{children}</main>
      </div>

      <style>{`
        .dash-shell { display: flex; min-height: 100vh; }
        .dash-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: auto; }
        .dash-content { flex: 1; padding: 28px; }
      `}</style>
    </div>
  );
}
