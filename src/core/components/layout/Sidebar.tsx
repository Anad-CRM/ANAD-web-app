"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";

const NAV = [
  {
    section: "Main",
    items: [
      { href: "/overview", label: "Dashboard", icon: "⊞" },
      { href: "/leads", label: "Leads", icon: "◈" },
      { href: "/calls", label: "Call Analytics", icon: "◎" },
    ],
  },
  {
    section: "Management",
    items: [
      { href: "/teams", label: "Teams", icon: "◷" },
      { href: "/eod", label: "EOD Reports", icon: "◻" },
      { href: "/integrations", label: "Integrations", icon: "⊕" },
    ],
  },
  {
    section: "Settings",
    items: [
      { href: "/ads", label: "Ads Analytics", icon: "◈" },
      { href: "/subscription", label: "Subscription", icon: "★" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className="flex flex-col sticky top-0 h-screen overflow-y-auto"
      style={{ width: "var(--sidebar-width)", minWidth: "var(--sidebar-width)", background: "var(--sidebar-bg)" }}
    >
      <div
        className="flex items-center gap-2.5 px-5 pt-[22px] pb-[18px]"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0 text-white font-extrabold text-base rounded-[9px]"
          style={{
            width: 34,
            height: 34,
            background: "var(--color-primary)",
            boxShadow: "0 2px 10px rgba(79,110,247,0.4)",
          }}
        >
          A
        </div>
        <span className="text-white font-extrabold text-[15px] tracking-tight">ANAD CRM</span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-6 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.section} className="flex flex-col gap-0.5">
            <p
              className="text-[10px] font-bold uppercase tracking-widest px-2 mb-1"
              style={{ color: "#475569" }}
            >
              {group.section}
            </p>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-2.5 py-[9px] rounded-[9px] no-underline text-[13.5px] font-medium relative transition-all duration-200"
                  style={{
                    color: active ? "var(--sidebar-active-text)" : "var(--sidebar-text)",
                    background: active ? "var(--sidebar-active-bg)" : "transparent",
                    fontWeight: active ? 600 : 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                      (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--sidebar-text)";
                    }
                  }}
                >
                  <span className="text-[15px] w-5 text-center flex-shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {active && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: "var(--color-primary)" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div
        className="flex items-center gap-2.5 px-4 py-3.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="flex items-center justify-center flex-shrink-0 rounded-full text-white text-[13px] font-bold"
            style={{ width: 32, height: 32, background: "var(--color-primary)" }}
          >
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#e2e8f0] truncate">{user?.name ?? "User"}</p>
            <p className="text-[11px] text-[#64748b] truncate">{user?.role ?? "—"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="flex-shrink-0 bg-transparent border-none text-[18px] cursor-pointer px-1.5 py-1 rounded-md transition-all duration-150"
          style={{ color: "#475569" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-danger)";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#475569";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          ⎋
        </button>
      </div>
    </aside>
  );
}
