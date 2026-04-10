"use client";

import { useAuthContext } from "@/modules/auth/stores/AuthContext";
import { usePathname } from "next/navigation";

const PAGE_LABELS: Record<string, string> = {
  "/overview": "Dashboard",
  "/leads": "Leads",
  "/calls": "Call Analytics",
  "/teams": "Teams",
  "/eod": "EOD Reports",
  "/integrations": "Integrations",
  "/ads": "Ads Analytics",
  "/subscription": "Subscription",
};

export default function Topbar() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  const pageTitle = PAGE_LABELS[pathname] ?? "Dashboard";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header
      className="flex items-center gap-5 px-7 sticky top-0 z-40"
      style={{
        height: "var(--topbar-height)",
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="flex-1 flex flex-col gap-px">
        <h1 className="text-[18px] font-extrabold leading-tight" style={{ color: "var(--color-text)" }}>
          {pageTitle}
        </h1>
        <p className="text-[12px]" style={{ color: "var(--color-muted)" }}>{today}</p>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 h-9 px-3.5 rounded-full min-w-[220px] transition-all duration-200"
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <span className="text-base" style={{ color: "var(--color-subtle)" }}>⌕</span>
          <input
            placeholder="Search leads, teams, staff…"
            className="border-none bg-transparent text-[13px] flex-1 outline-none"
            style={{ color: "var(--color-text)" }}
          />
        </div>

        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-full cursor-pointer text-[15px] transition-all duration-150"
          aria-label="Notifications"
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <span>🔔</span>
          <span
            className="absolute flex items-center justify-center text-white font-bold rounded-full"
            style={{
              top: -3,
              right: -3,
              width: 15,
              height: 15,
              fontSize: 9,
              background: "var(--color-danger)",
              border: "1.5px solid #fff",
            }}
          >
            3
          </span>
        </button>

        <div
          className="flex items-center justify-center w-9 h-9 rounded-full text-[14px] font-bold text-white cursor-pointer"
          title={user?.name ?? "Profile"}
          style={{
            background: "var(--color-primary)",
            boxShadow: "0 2px 8px rgba(79,110,247,0.25)",
          }}
        >
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
