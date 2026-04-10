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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-9 h-9 rounded-full border-[3px] animate-spin border-gray-200 border-t-[#233A78]" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Topbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
