"use client";

import { useAuth } from "@/modules/auth/hooks/useAuth";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useSidebar } from "@/core/contexts/SidebarContext";
import { COLORS } from "@/core/components/theme/colors";
import { Text } from "@/core/components/ui/Text";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();

  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 md:px-8 h-16 md:h-20 bg-white">
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggleSidebar}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors"
          style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primaryDark }}
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border flex-shrink-0" style={{ borderColor: COLORS.text }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.text}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <Text as="span" size="xs" weight="medium" className="leading-none mb-1 sm:mb-1.5" style={{ color: COLORS.muted }}>
              {greeting}
            </Text>
            <div className="flex items-center gap-2">
              <Text as="h1" size="xl" weight="bold" className="tracking-tight leading-none" style={{ color: COLORS.text }}>
                {user?.userName}
              </Text>
              {user?.role && (
                <span
                  className="hidden sm:inline-block px-2 py-0.5 text-[12px] font-bold rounded-full leading-tight"
                  style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primaryDark }}
                >
                  {user.role}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.text }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <Link href="/notifications" className="flex items-center justify-center w-10 h-10 rounded-full relative hover:opacity-80 transition-opacity" style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.text }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-[10px] right-[10px] w-[6px] h-[6px] rounded-full" style={{ backgroundColor: COLORS.primaryDark }} />
        </Link>

        <Link href="/profile" className="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden shadow-sm hover:opacity-80 transition-opacity" style={{ backgroundColor: COLORS.primaryXlight, color: COLORS.primaryDark }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-1"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </Link>

        <div className="hidden sm:block w-[1px] h-8 mx-1" style={{ backgroundColor: COLORS.border }}></div>

        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 h-10 rounded-lg transition-colors font-medium text-[14px]"
          style={{ backgroundColor: "rgba(239, 68, 68, 0.08)", color: "#DC2626" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
