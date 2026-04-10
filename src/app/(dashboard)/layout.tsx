"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/modules/auth/stores/AuthContext";
import Sidebar from "@/core/components/layout/Sidebar";
import Topbar from "@/core/components/layout/Topbar";

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div
          className="w-9 h-9 rounded-full border-[3px] animate-spin"
          style={{
            borderColor: "var(--color-border)",
            borderTopColor: "var(--color-primary)",
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <Topbar />
        <main className="flex-1 p-7">{children}</main>
      </div>
    </div>
  );
}
