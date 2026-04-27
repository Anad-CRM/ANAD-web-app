"use client";

import { useAuth } from "@/modules/auth/hooks/useAuth";
import { COLORS } from "@/core/components/theme/colors";
import Link from "next/link";

export default function Topbar() {
  const { user, logout } = useAuth();

  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  return (
    <header className="flex items-center justify-between px-8 h-20 bg-white">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-black flex-shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
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
            <span className="text-[13px] text-gray-500 font-medium leading-none mb-1.5">{greeting}</span>
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-bold text-black tracking-tight leading-none">{user?.userName}</h1>
              {user?.role && (
                <span className="px-2 py-0.5 bg-[#E2E8F0] text-[#1E3A8A] text-[12px] font-bold rounded-full leading-tight">
                  {user.role}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E2E8F0] text-black">
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

        <Link href="/notifications" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E2E8F0] text-black relative hover:opacity-80 transition-opacity">
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
          <span className="absolute top-[10px] right-[10px] w-[6px] h-[6px] bg-[#1E3A8A] rounded-full" />
        </Link>

        <Link href="/profile" className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E2E8F0] text-[#1E3A8A] overflow-hidden shadow-sm hover:opacity-80 transition-opacity">
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

        <div className="w-[1px] h-8 bg-gray-200 mx-1"></div>

        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium text-[14px]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
