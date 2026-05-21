"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/modules/auth/stores/AuthContext";
import { SidebarProvider } from "@/core/contexts/SidebarContext";
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
    <SidebarProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-white">
        <Topbar />
        <div className="flex min-h-0 flex-1 overflow-hidden bg-[#DCE6F2]">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
